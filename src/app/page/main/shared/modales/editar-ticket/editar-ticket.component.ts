// editar-ticket.component.ts
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

// Interface unificada - usando la misma nomenclatura que vista-coordinador y listado
interface Ticket {
  idNoConformidad: number;
  idCodigoNC: string;
  idCategoria: number;
  descripcion: string;
  fechaIncidente: string;
  descripcionNC: string;
  idPrioridad: number;
  cPrioridad: string;
  detalleServicioNC: string;
  cUsOrigen: string;
  cAreaOrigen: string;
  cPuestoOrigen: string;
  unidadDestino: number;
  cAreaDestino: string;
  cPerJuridica: string;
  cFilDestino: string;
  estadoNC: number;
  cEstado: string;
  fechaRegistro: string;
  cPerCodigoDeriva: string;
  correoDeriva: string;
  cUsDestino: string;
  cUnidadDestino: string;
  cCargoDestino: string;
  // Campos adicionales (pueden estar o no dependiendo del contexto)
  cCodigoServ?: string;
  nUniOrgCodigo?: number;
  cUniOrgNombre?: string;
  descripcionCat?: string;
  cPerCodigo?: string;
  cNombreUsuario?: string;
  cDepartamento?: string;
  usuarioCorreo?: string;
  cPerCodigoSuper?: string;
  cNombreSupervisor?: string;
  cCargoSupervisor?: string;
  correoSupervisor?: string;
  nTipCur?: number;
  tipoNC?: number;
  nPrdCodigo?: number;
  detalleNC?: string | null;
  respuestaNC?: string | null;
  dFechaFinal?: string;
}

// Interfaz para las categorías tal como vienen de la API
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
  @Output() public ticketEditado: EventEmitter<Ticket> = new EventEmitter<Ticket>();

  // Formulario reactivo
  public editForm: FormGroup;

  // Fecha mínima y máxima para el calendario
  public maxDate: Date = new Date();

  // Datos completos del servicio desde la API
  public servicioCompleto: Ticket | null = null;

  // Opciones para los dropdowns
  public prioridadOptions = [
    { label: 'Alta', value: 'Alta' },
    { label: 'Media', value: 'Media' },
    { label: 'Baja', value: 'Baja' }
  ];

  // Lista de categorías
  public categoriasOptions: CategoriaOption[] = [];

  // Estados de carga
  public loading: boolean = false;
  public loadingCategorias: boolean = false;

  constructor() {
    // Inicializar el formulario
    this.editForm = this._formBuilder.group({
      fechaIncidente: [null], // Campo opcional
      idCategoria: [null, Validators.required], // Campo requerido para categoría
      prioridad: ['Media', Validators.required], // Campo requerido para prioridad
      descripcionNC: [''], // Campo opcional para lugar
      detalleServicioNC: ['', [Validators.required, Validators.maxLength(2000)]] // Campo requerido para detalle
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
          const servicios = response.body.lstItem;

          // Buscar el servicio específico y mapearlo
          const servicioEncontrado = servicios.find((s: any) =>
            s.idNoConformidad === this.ticket?.idNoConformidad
          );

          if (servicioEncontrado) {
            this.servicioCompleto = this.mapearServicioDeAPI(servicioEncontrado);
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
   * Mapear servicio de la API al formato unificado
   */
  private mapearServicioDeAPI(item: any): Ticket {
    return {
      // Campos base
      idNoConformidad: item.idNoConformidad,
      idCodigoNC: item.idCodigoNC,
      idCategoria: item.idCategoria,
      descripcion: item.descripcionCat || item.descripcion || '',
      fechaIncidente: this.formatearFecha(item.fechaIncidente || item.dFechaFinal),
      descripcionNC: item.descripcionNC || '',
      idPrioridad: item.idPrioridad,
      cPrioridad: item.cPrioridad,
      detalleServicioNC: item.detalleServicioNC,
      cUsOrigen: item.cPerCodigo || '',
      cAreaOrigen: item.cDepartamento || '',
      cPuestoOrigen: item.cCargoSupervisor || '',
      unidadDestino: item.nUniOrgCodigo || 0,
      cAreaDestino: item.cAreaDestino || item.cUniOrgNombre || '',
      cPerJuridica: item.cPerJuridica || '',
      cFilDestino: item.cFilial || '',
      estadoNC: item.estadoNC,
      cEstado: item.cEstado,
      fechaRegistro: this.formatearFecha(item.fechaRegistro),
      cPerCodigoDeriva: item.cPerCodigoSuper || '',
      correoDeriva: item.correoSupervisor || '',
      cUsDestino: item.cNombreSupervisor || '',
      cUnidadDestino: item.cUniOrgNombre || '',
      cCargoDestino: item.cCargoSupervisor || '',
      // Campos adicionales opcionales
      cCodigoServ: item.cCodigoServ || '',
      nUniOrgCodigo: item.nUniOrgCodigo || 0,
      cUniOrgNombre: item.cUniOrgNombre || '',
      descripcionCat: item.descripcionCat || '',
      cPerCodigo: item.cPerCodigo || '',
      cNombreUsuario: item.cNombreUsuario || '',
      cDepartamento: item.cDepartamento || '',
      usuarioCorreo: item.usuarioCorreo || '',
      cPerCodigoSuper: item.cPerCodigoSuper || '',
      cNombreSupervisor: item.cNombreSupervisor || '',
      cCargoSupervisor: item.cCargoSupervisor || '',
      correoSupervisor: item.correoSupervisor || '',
      nTipCur: item.nTipCur || 0,
      tipoNC: item.tipoNC || 0,
      nPrdCodigo: item.nPrdCodigo || 0,
      detalleNC: item.detalleNC || null,
      respuestaNC: item.respuestaNC || null,
      dFechaFinal: this.formatearFecha(item.dFechaFinal) || ''
    };
  }

  /**
   * Formatear fechas de la API
   */
  private formatearFecha(fechaAPI: string): string {
    if (!fechaAPI) return '';

    try {
      // La fecha viene en formato "06/01/2025 00:00:00" o "06/02/2025 09:57:51"
      const [fecha] = fechaAPI.split(' ');
      return fecha; // Retorna solo la parte de la fecha
    } catch (error) {
      console.error('Error al formatear fecha:', fechaAPI, error);
      return fechaAPI;
    }
  }

  /**
   * Cargar las categorías disponibles desde la API
   */
  private cargarCategorias(): void {
    this.loadingCategorias = true;

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

          this.categoriasOptions = categoriasResponse.map(item => ({
            name: item.descripcion,
            value: item.codigo
          }));

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
        this.categoriasOptions = [];
      }
    });
  }

  /**
   * Llenar el formulario con los datos de la API
   */
  private llenarFormulario(): void {
    if (!this.servicioCompleto) return;

    console.log('Datos completos del servicio:', this.servicioCompleto);

    // Convertir la fechaIncidente si existe
    let fechaIncidente: Date | null = null;
    if (this.servicioCompleto.fechaIncidente) {
      fechaIncidente = this.parsearFecha(this.servicioCompleto.fechaIncidente);
    }

    // Llenar el formulario con los campos correctos de la API
    this.editForm.patchValue({
      fechaIncidente: fechaIncidente,
      idCategoria: this.servicioCompleto.idCategoria,
      prioridad: this.servicioCompleto.cPrioridad,
      descripcionNC: this.servicioCompleto.descripcionNC || '',
      detalleServicioNC: this.servicioCompleto.detalleServicioNC || ''
    });

    console.log('Formulario llenado con datos de la API');
    this.editForm.updateValueAndValidity();
  }

  /**
   * Parsear fecha desde string a Date
   */
  private parsearFecha(fechaStr: string): Date | null {
    try {
      if (!fechaStr || fechaStr.trim() === '') {
        return null;
      }

      // Limpiar la fecha - quitar la parte de hora si existe
      const fechaLimpia = fechaStr.split(' ')[0];

      // Manejar formato mm/dd/yyyy o dd/mm/yyyy
      if (fechaLimpia.includes('/')) {
        const partes = fechaLimpia.split('/');

        if (partes.length === 3) {
          const parte1 = parseInt(partes[0]);
          const parte2 = parseInt(partes[1]);
          const año = parseInt(partes[2]);

          let dia: number, mes: number;

          if (parte1 > 12) {
            // Formato dd/mm/yyyy
            dia = parte1;
            mes = parte2 - 1;
          } else if (parte2 > 12) {
            // Formato mm/dd/yyyy
            mes = parte1 - 1;
            dia = parte2;
          } else {
            // Asumir mm/dd/yyyy
            mes = parte1 - 1;
            dia = parte2;
          }

          const fecha = new Date(año, mes, dia, 12, 0, 0);

          if (isNaN(fecha.getTime())) {
            return null;
          }

          return fecha;
        }
      }

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
   * Formatear fecha para envío a la API
   */
  private formatearFechaParaAPI(fecha: Date): string {
    try {
      const fechaFormateada = fecha.toLocaleDateString();

      if (!fechaFormateada || fechaFormateada === 'Invalid Date') {
        return '';
      }

      return fechaFormateada;
    } catch (error) {
      console.error('Error al formatear fecha:', fecha, error);
      return '';
    }
  }

  /**
   * Obtener descripción de categoría por ID
   */
  private obtenerDescripcionCategoria(idCategoria: number): string {
    const categoria = this.categoriasOptions.find(cat => cat.value === idCategoria);
    return categoria?.name || '';
  }

  /**
   * Convertir la etiqueta de prioridad a su valor numérico para la API
   */
  private obtenerValorPrioridad(etiquetaPrioridad: string): number {
    switch (etiquetaPrioridad) {
      case 'Alta': return 1;
      case 'Media': return 2;
      case 'Baja': return 3;
      default: return 2;
    }
  }

  close(): void {
    this.editForm.reset();
    this.btnCerrar.emit();
  }

  guardar(): void {
    // Validar que las categorías estén cargadas
    if (this.categoriasOptions.length === 0 && !this.loadingCategorias) {
      console.error('No se pueden guardar cambios: categorías no disponibles');
      return;
    }

    // Validaciones iniciales
    if (!this.editForm.valid) {
      console.log('Formulario inválido');
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.ticket || !this.servicioCompleto) {
      console.error('No hay datos suficientes para guardar');
      return;
    }

    const formValues = this.editForm.value;
    console.log('Iniciando proceso de guardado...');

    // Preparar datos para la API
    const fechaFormateada = formValues.fechaIncidente ? this.formatearFechaParaAPI(formValues.fechaIncidente) : '';

    const datosParaAPI = {
      cPerCodigo: this._mainSharedService.cPerCodigo(),
      idNoConformidad: this.servicioCompleto.idNoConformidad,
      idCategoria: formValues.idCategoria,
      dfechaIncidente: fechaFormateada,
      cLugarIncidente: formValues.descripcionNC || '',
      idPrioridad: this.obtenerValorPrioridad(formValues.prioridad),
      cDetalleServicio: formValues.detalleServicioNC || '',
      idCodigoNC: this.servicioCompleto.cCodigoServ || this.servicioCompleto.idCodigoNC
    };

    console.log('Datos preparados para la API:', datosParaAPI);

    // Llamar al servicio para actualizar
    this.loading = true;

    this._mainService.put_EditarServicioNC(datosParaAPI).subscribe({
      next: (response) => {
        console.log('Respuesta exitosa:', response);

        if (response.status === 200) {
          console.log('Servicio actualizado exitosamente');

          // Crear el ticket actualizado con la nomenclatura unificada
          const ticketActualizado: Ticket = {
            ...this.servicioCompleto!,
            idCategoria: datosParaAPI.idCategoria,
            descripcionCat: this.obtenerDescripcionCategoria(datosParaAPI.idCategoria),
            descripcion: this.obtenerDescripcionCategoria(datosParaAPI.idCategoria),
            fechaIncidente: datosParaAPI.dfechaIncidente,
            descripcionNC: datosParaAPI.cLugarIncidente,
            cPrioridad: formValues.prioridad,
            idPrioridad: datosParaAPI.idPrioridad,
            detalleServicioNC: datosParaAPI.cDetalleServicio
          };

          console.log('Ticket actualizado para emisión:', ticketActualizado);

          // Emitir el ticket actualizado
          this.ticketEditado.emit(ticketActualizado);

          // Cerrar modal
          this.close();
        } else {
          console.error('Error en la actualización:', response.body);
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error de la API:', error);
        this.loading = false;
      }
    });
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

  /**
   * Reintentar la carga de categorías
   */
  reintentarCargaCategorias(): void {
    if (!this.loadingCategorias) {
      console.log('Reintentando carga de categorías...');
      this.cargarCategorias();
    }
  }

  // Método helper para obtener el código del servicio
  getCodigoServicio(): string {
    if (!this.servicioCompleto) return '';
    return this.servicioCompleto.cCodigoServ || this.servicioCompleto.idCodigoNC || 'No especificado';
  }
}