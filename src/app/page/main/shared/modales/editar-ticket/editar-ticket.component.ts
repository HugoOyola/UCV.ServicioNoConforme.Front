import { Component, EventEmitter, Input, Output, OnChanges, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MainService } from '../../../services/main.service';
import { MainSharedService } from '@shared/services/main-shared.service';

interface Ticket {
  id: string;
  idNoConformidad?: number;
  fecha: string;
  areaDestino: string;
  categoria: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'En Revisión' | 'Cerrado' | 'Derivado';
  detalle: string;
  lugar: string;
  fechaRegistro: string;
}

// Interfaz para la respuesta completa de la API
interface ServicioNoConformeDetalle {
  idNoConformidad: number;
  cCodigoServ: string;
  idCodigoNC: string;
  nUniOrgCodigo: number;
  cUniOrgNombre: string;
  idCategoria: number;
  descripcionCat: string;
  fechaIncidente: string | null;
  descripcionNC: string;
  idPrioridad: number;
  cPrioridad: string;
  detalleServicioNC: string;
  cPerCodigo: string;
  cNombreUsuario: string;
  cDepartamento: string;
  usuarioCorreo: string;
  cPerJuridica: string;
  cFilial: string;
  cPerCodigoSuper: string;
  cNombreSupervisor: string;
  cAreaDestino: string;
  cCargoSupervisor: string;
  correoSupervisor: string;
  fechaRegistro: string;
  nTipCur: number;
  tipoNC: number;
  nPrdCodigo: number;
  detalleNC: string | null;
  respuestaNC: string | null;
  estadoNC: number;
  cEstado: string;
  dFechaFinal: string;
}

// Interfaz para las categorías tal como vienen de la API (basada en el componente de registro)
interface Categoria {
  codigo: number;
  categoria: number;
  jerarquia: string | null;
  nombre: string;
  descripcion: string;
  tipo: number;
}

// Interfaz para las opciones del select de categorías
interface CategoriaOption {
  name: string;
  value: number;
}

@Component({
  selector: 'app-editar-ticket',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    SelectModule,
    CalendarModule,
    ButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './editar-ticket.component.html',
  styleUrls: ['./editar-ticket.component.scss']
})
export class EditarTicketComponent implements OnChanges, OnInit {
  private _mainService = inject(MainService);
  private _mainSharedService = inject(MainSharedService);
  private _formBuilder = inject(FormBuilder);

  @Input() public visible: boolean = false;
  @Input() public ticket: Ticket | null = null;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();
  @Output() public btnGuardar: EventEmitter<Ticket> = new EventEmitter<Ticket>();

  // Formulario reactivo
  public editForm: FormGroup;

  // Fecha mínima y máxima para el calendario
  public maxDate: Date = new Date();

  // Datos completos del servicio desde la API
  public servicioCompleto: ServicioNoConformeDetalle | null = null;

  // Opciones para los dropdowns
  public prioridadOptions = [
    { label: 'Alta', value: 'Alta' },
    { label: 'Media', value: 'Media' },
    { label: 'Baja', value: 'Baja' }
  ];

  // Lista de categorías usando la misma estructura que el componente de registro
  public categoriasOptions: CategoriaOption[] = [];

  // Estados de carga
  public loading: boolean = false;
  public loadingCategorias: boolean = false;

  constructor() {
    // Inicializar el formulario con los campos correctos de la API
    this.editForm = this._formBuilder.group({
      fechaIncidente: [null], // Campo correcto para fecha del incidente
      idCategoria: [null, Validators.required], // Campo correcto para categoría
      prioridad: ['Media', Validators.required],
      descripcionNC: ['', Validators.required], // Campo correcto para lugar (descripcionNC)
      detalleServicioNC: ['', [Validators.required, Validators.maxLength(2000)]] // Campo correcto para detalle
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  ngOnChanges(): void {
    // Cuando el ticket de entrada cambia y el modal se hace visible
    if (this.ticket && this.visible) {
      this.cargarDatosCompletos();
    }
  }

  /**
   * Cargar los datos completos del servicio desde la API
   */
  private cargarDatosCompletos(): void {
    if (!this.ticket?.idNoConformidad) {
      console.error('No se puede cargar: falta idNoConformidad');
      return;
    }

    this.loading = true;
    const cPerCodigo = this._mainSharedService.cPerCodigo();

    if (!cPerCodigo) {
      console.error('No se ha identificado el usuario');
      this.loading = false;
      return;
    }

    // Obtener el listado completo y filtrar por el ticket actual
    this._mainService.post_ObtenerListadoServiciosNC(cPerCodigo).subscribe({
      next: (response) => {
        if (response.body?.lstItem) {
          const servicios = response.body.lstItem as ServicioNoConformeDetalle[];

          // Buscar el servicio específico
          this.servicioCompleto = servicios.find(s =>
            s.idNoConformidad === this.ticket?.idNoConformidad
          ) || null;

          if (this.servicioCompleto) {
            this.llenarFormulario();
          } else {
            console.error('No se encontró el servicio con ID:', this.ticket?.idNoConformidad);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del servicio:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Cargar las categorías disponibles desde la API usando los mismos parámetros que el registro
   */
  private cargarCategorias(): void {
    this.loadingCategorias = true;

    // Usar los mismos parámetros que en el componente de registro
    const params = {
      nIntCodigo: 0,
      nIntClase: 1001,
      nIntTipo: 0,
      cIntJerarquia: ""
    };

    this._mainService.post_ObtenerServicioListadoCategoria(
      params.nIntCodigo,
      params.nIntClase,
      params.nIntTipo,
      params.cIntJerarquia
    ).subscribe({
      next: (response) => {
        if (response.body?.lstItem && response.body.lstItem.length > 0) {
          const categoriasResponse: Categoria[] = response.body.lstItem;

          // Mapear a la estructura necesaria para el select (igual que en registro)
          this.categoriasOptions = categoriasResponse.map(item => ({
            name: item.descripcion,
            value: item.codigo
          }));

          // Ordenar alfabéticamente las categorías
          this.categoriasOptions.sort((a, b) => a.name.localeCompare(b.name));

          console.log('Categorías cargadas para edición:', this.categoriasOptions.length);
        } else {
          console.warn('No se encontraron categorías en la respuesta');
          this.categoriasOptions = [];
        }
        this.loadingCategorias = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.loadingCategorias = false;
        // Fallback con categorías básicas
        this.categoriasOptions = [
          { name: 'SEGURIDAD', value: 9 },
          { name: 'SERVICIO', value: 1 },
          { name: 'INFRAESTRUCTURA', value: 2 }
        ];
      }
    });
  }

  /**
   * Llenar el formulario con los datos correctos de la API
   */
  private llenarFormulario(): void {
    if (!this.servicioCompleto) return;

    console.log('Datos completos del servicio:', this.servicioCompleto);
    console.log('fechaIncidente original:', this.servicioCompleto.fechaIncidente);

    // Convertir la fechaIncidente si existe (puede ser null)
    let fechaIncidente: Date | null = null;
    if (this.servicioCompleto.fechaIncidente) {
      fechaIncidente = this.parsearFecha(this.servicioCompleto.fechaIncidente);
      console.log('Fecha parseada:', fechaIncidente);

      // Verificar que la fecha se parseó correctamente
      if (fechaIncidente) {
        console.log('Fecha para datepicker:', fechaIncidente.toLocaleDateString());
      }
    } else {
      console.log('fechaIncidente es null o vacío');
    }

    // Llenar el formulario con los campos correctos de la API
    this.editForm.patchValue({
      fechaIncidente: fechaIncidente, // fechaIncidente (puede ser null)
      idCategoria: this.servicioCompleto.idCategoria, // idCategoria
      prioridad: this.mapearPrioridad(this.servicioCompleto.cPrioridad), // cPrioridad
      descripcionNC: this.servicioCompleto.descripcionNC || '', // descripcionNC (lugar)
      detalleServicioNC: this.servicioCompleto.detalleServicioNC || '' // detalleServicioNC (detalle)
    });

    console.log('Formulario llenado con datos de la API:', {
      fechaIncidente: this.servicioCompleto.fechaIncidente,
      fechaParseada: fechaIncidente,
      fechaParaDatepicker: fechaIncidente ? fechaIncidente.toLocaleDateString() : 'null',
      idCategoria: this.servicioCompleto.idCategoria,
      descripcionCat: this.servicioCompleto.descripcionCat,
      cPrioridad: this.servicioCompleto.cPrioridad,
      descripcionNC: this.servicioCompleto.descripcionNC,
      detalleServicioNC: this.servicioCompleto.detalleServicioNC
    });

    console.log('Valores del formulario después del patchValue:', this.editForm.value);

    // Forzar actualización del formulario si es necesario
    this.editForm.updateValueAndValidity();
  }

  /**
   * Función específica para limpiar fechas con formato "05/20/2025 00:00:00"
   */
  private limpiarFechaConHora(fechaStr: string): string {
    if (!fechaStr) return '';

    // Remover la parte de hora si existe
    const partes = fechaStr.split(' ');
    return partes[0]; // Devolver solo la parte de fecha
  }

  /**
   * Parsear fecha desde string a Date - Compatible con formato "05/20/2025 00:00:00"
   */
  private parsearFecha(fechaStr: string): Date | null {
    try {
      console.log('Parseando fecha:', fechaStr);

      // Si la fecha está vacía o es null, retornar null
      if (!fechaStr || fechaStr.trim() === '') {
        return null;
      }

      // Limpiar la fecha - quitar la parte de hora si existe
      const fechaLimpia = this.limpiarFechaConHora(fechaStr.trim());
      console.log('Fecha limpia (sin hora):', fechaLimpia);

      // Manejar formato mm/dd/yyyy o dd/mm/yyyy
      if (fechaLimpia.includes('/')) {
        const partes = fechaLimpia.split('/');

        if (partes.length === 3) {
          const parte1 = parseInt(partes[0]);
          const parte2 = parseInt(partes[1]);
          const año = parseInt(partes[2]);

          // Determinar si es mm/dd/yyyy o dd/mm/yyyy
          // Si el primer número es mayor a 12, entonces es dd/mm/yyyy
          // Si el segundo número es mayor a 12, entonces es mm/dd/yyyy
          let dia: number, mes: number;

          if (parte1 > 12) {
            // Formato dd/mm/yyyy
            dia = parte1;
            mes = parte2 - 1; // Los meses en JS van de 0-11
          } else if (parte2 > 12) {
            // Formato mm/dd/yyyy
            mes = parte1 - 1; // Los meses en JS van de 0-11
            dia = parte2;
          } else {
            // Ambos números son <= 12, asumir mm/dd/yyyy (formato americano común en APIs)
            mes = parte1 - 1;
            dia = parte2;
          }

          console.log('Fecha parseada:', { mes: mes + 1, dia, año });

          // Crear la fecha a mediodía para evitar problemas de zona horaria
          const fecha = new Date(año, mes, dia, 12, 0, 0);

          // Verificar que la fecha sea válida
          if (isNaN(fecha.getTime())) {
            console.warn('Fecha inválida después del parseo:', { mes, dia, año });
            return null;
          }

          return fecha;
        }
      }

      // Intentar parseo directo si no es formato mm/dd/yyyy o dd/mm/yyyy
      const fechaParsed = new Date(fechaLimpia);
      if (!isNaN(fechaParsed.getTime())) {
        return fechaParsed;
      }

      return null;
    } catch (error) {
      console.warn('Error al parsear fecha:', fechaStr, error);
      return null;
    }
  }

  /**
   * Mapear prioridad de string a formato esperado
   */
  private mapearPrioridad(prioridad: string): 'Alta' | 'Media' | 'Baja' {
    switch (prioridad?.toLowerCase()) {
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Media';
      case 'baja':
        return 'Baja';
      default:
        return 'Media';
    }
  }

  /**
   * Formatear fecha para envío - Sin hora, solo fecha
   */
  private formatearFecha(fecha: Date): string {
    // Asegurar que solo se envíe la fecha sin hora
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    // Formato mm/dd/yyyy (común en APIs) o dd/mm/yyyy según tu preferencia
    // Cambiar el orden si necesitas dd/mm/yyyy
    const fechaFormateada = `${mes}/${dia}/${año}`;

    console.log('Fecha formateada para envío:', fechaFormateada);
    return fechaFormateada;
  }

  /**
   * Obtener descripción de categoría por ID
   */
  private obtenerDescripcionCategoria(idCategoria: number): string {
    const categoria = this.categoriasOptions.find(cat => cat.value === idCategoria);
    return categoria?.name || '';
  }

  close(): void {
    this.editForm.reset();
    this.btnCerrar.emit();
  }

  guardar(): void {
    if (this.editForm.valid && this.ticket) {
      const formValues = this.editForm.value;

      // Crear el ticket actualizado con los datos correctos del formulario
      const ticketActualizado: Ticket = {
        ...this.ticket,
        // Mapear los campos de la API a la interfaz Ticket
        fecha: formValues.fechaIncidente ? this.formatearFecha(formValues.fechaIncidente) : '',
        categoria: this.obtenerDescripcionCategoria(formValues.idCategoria),
        prioridad: formValues.prioridad,
        detalle: formValues.detalleServicioNC, // detalleServicioNC es el detalle
        lugar: formValues.descripcionNC // descripcionNC es el lugar
      };

      console.log('Ticket actualizado enviado:', ticketActualizado);
      console.log('Datos del formulario:', formValues);

      this.btnGuardar.emit(ticketActualizado);
      this.close();
    } else {
      // Marcar campos como tocados para mostrar errores
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Verificar si un campo tiene errores y ha sido tocado
   */
  hasError(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (field.errors['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }
}