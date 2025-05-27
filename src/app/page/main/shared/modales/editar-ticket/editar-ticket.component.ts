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
    // CAMBIO: Hacer fechaIncidente y descripcionNC opcionales
    this.editForm = this._formBuilder.group({
      fechaIncidente: [null], // Campo opcional (sin validadores)
      idCategoria: [null, Validators.required], // Campo requerido para categoría
      prioridad: ['Media', Validators.required], // Campo requerido para prioridad
      descripcionNC: [''], // Campo opcional para lugar (sin Validators.required)
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
        // No usar fallback hardcodeado - dejar vacío y mostrar el error al usuario
        this.categoriasOptions = [];

        // Aquí podrías mostrar un mensaje de error al usuario
        // Por ejemplo: this._messageService.add({
        //   severity: 'error',
        //   summary: 'Error',
        //   detail: 'No se pudieron cargar las categorías. Por favor, recargue la página o contacte al administrador.'
        // });
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

    // Llenar el formulario with los campos correctos de la API
    // CAMBIO: descripcionNC puede ser vacío (campo opcional)
    this.editForm.patchValue({
      fechaIncidente: fechaIncidente, // fechaIncidente (puede ser null)
      idCategoria: this.servicioCompleto.idCategoria, // idCategoria
      prioridad: this.mapearPrioridad(this.servicioCompleto.cPrioridad), // cPrioridad
      descripcionNC: this.servicioCompleto.descripcionNC || '', // descripcionNC (lugar) - opcional
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

      // Intentar parseo directo si no es formato mm/dd/yyyy or dd/mm/yyyy
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
   * Formatear fecha para envío replicando exactamente el comportamiento del registro
   */
  private formatearFecha(fecha: Date): string {
    try {
      console.log('Fecha original para formatear:', fecha);

      // OPCIÓN 1: Si en el registro usas simplemente toLocaleDateString()
      const fechaFormateada = fecha.toLocaleDateString();

      // OPCIÓN 2: Si en el registro usas toLocaleDateString() con configuración específica
      // Descomenta estas líneas si es necesario:
      // fechaFormateada = fecha.toLocaleDateString('es-ES', {
      //   day: '2-digit',
      //   month: '2-digit',
      //   year: 'numeric'
      // });

      console.log('Fecha formateada:', fechaFormateada);
      console.log('Tipo de fecha formateada:', typeof fechaFormateada);

      // Debug: Mostrar cómo se vería la fecha en diferentes formatos
      console.log('=== COMPARACIÓN DE FORMATOS ===');
      console.log('toLocaleDateString():', fecha.toLocaleDateString());
      console.log('toLocaleDateString("es-ES"):', fecha.toLocaleDateString('es-ES'));
      console.log('toISOString():', fecha.toISOString());
      console.log('toString():', fecha.toString());
      console.log('===============================');

      // Validar que la fecha formateada no esté vacía
      if (!fechaFormateada || fechaFormateada === 'Invalid Date') {
        console.warn('Fecha inválida después del formateo:', fechaFormateada);
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

  close(): void {
    this.editForm.reset();
    this.btnCerrar.emit();
  }

  guardar(): void {
    // Validar que las categorías estén cargadas
    if (this.categoriasOptions.length === 0 && !this.loadingCategorias) {
      console.error('No se pueden guardar cambios: categorías no disponibles');
      // Aquí podrías mostrar un mensaje específico al usuario
      // Por ejemplo: this._messageService.add({
      //   severity: 'error',
      //   summary: 'Error',
      //   detail: 'No se pueden guardar los cambios porque las categorías no están disponibles. Recargue la página.'
      // });
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

    if (!this.ticket) {
      console.error('No hay ticket para editar');
      return;
    }

    if (!this.servicioCompleto) {
      console.error('No se han cargado los datos completos del servicio');
      return;
    }

    if (!this.ticket.id) {
      console.error('El ticket no tiene ID válido');
      return;
    }

    // En este punto, TypeScript sabe que this.ticket no es null
    const ticketActual: Ticket = this.ticket;

    const formValues = this.editForm.value;

    console.log('Iniciando proceso de guardado...');
    console.log('Valores del formulario:', formValues);

    // Preparar datos para la API según el formato requerido
    // CAMBIO: Manejar campos opcionales correctamente
    const fechaFormateada = formValues.fechaIncidente ? this.formatearFecha(formValues.fechaIncidente) : '';

    const datosParaAPI = {
      cPerCodigo: this._mainSharedService.cPerCodigo(),
      idNoConformidad: this.servicioCompleto.idNoConformidad,
      idCategoria: formValues.idCategoria,
      dfechaIncidente: fechaFormateada, // Puede ser cadena vacía si no hay fecha
      cLugarIncidente: formValues.descripcionNC || '', // Puede ser cadena vacía
      idPrioridad: this.obtenerValorPrioridad(formValues.prioridad),
      cDetalleServicio: formValues.detalleServicioNC || '',
      idCodigoNC: this.servicioCompleto.cCodigoServ
    };

    console.log('=== DEBUG CAMPOS OPCIONALES ===');
    console.log('Fecha del formulario (Date object):', formValues.fechaIncidente);
    console.log('Fecha formateada para API:', fechaFormateada);
    console.log('Lugar del formulario:', formValues.descripcionNC);
    console.log('Lugar para API:', datosParaAPI.cLugarIncidente);
    console.log('===============================');

    console.log('Datos preparados para la API:', datosParaAPI);

    // Validaciones exhaustivas antes del envío
    console.log('=== VALIDACIONES PREVIAS ===');

    // Validar datos requeridos (sin incluir campos opcionales)
    const validaciones = {
      cPerCodigo: !!datosParaAPI.cPerCodigo,
      idNoConformidad: !!datosParaAPI.idNoConformidad && datosParaAPI.idNoConformidad > 0,
      idCategoria: !!datosParaAPI.idCategoria && datosParaAPI.idCategoria > 0,
      idPrioridad: !!datosParaAPI.idPrioridad && ['1', '2', '3'].includes(datosParaAPI.idPrioridad),
      idCodigoNC: !!datosParaAPI.idCodigoNC,
      cDetalleServicio: !!datosParaAPI.cDetalleServicio && datosParaAPI.cDetalleServicio.length > 0
      // CAMBIO: No validar dfechaIncidente y cLugarIncidente como requeridos
    };

    console.log('Resultados de validación:', validaciones);

    // Verificar si alguna validación falló
    const validacionesFallidas = Object.entries(validaciones)
      .filter(([key, valid]) => !valid)
      .map(([key]) => key);

    if (validacionesFallidas.length > 0) {
      console.error('Validaciones fallidas:', validacionesFallidas);
      console.error('Datos que causaron el fallo:',
        validacionesFallidas.reduce((obj, key) => {
          obj[key] = datosParaAPI[key as keyof typeof datosParaAPI];
          return obj;
        }, {} as any)
      );
      this.loading = false;
      return;
    }

    console.log('Todas las validaciones pasaron correctamente');
    console.log('============================');

    // Verificar configuración del endpoint
    if (!this.verificarConfiguracionEndpoint()) {
      console.error('Error en la configuración del endpoint');
      this.loading = false;
      return;
    }

    // Llamar al servicio para actualizar
    this.loading = true;

    console.log('=== ENVIANDO DATOS A LA API ===');
    console.log('URL del endpoint:', this._mainService['ApiServicioNC']?.url);
    console.log('Datos completos:', JSON.stringify(datosParaAPI, null, 2));
    console.log('=================================');

    this._mainService.put_EditarServicioNC(datosParaAPI).subscribe({
      next: (response) => {
        console.log('=== RESPUESTA EXITOSA ===');
        console.log('Status:', response.status);
        console.log('Response body:', response.body);
        console.log('========================');

        if (response.status === 200) {
          console.log('Servicio actualizado exitosamente');

          // Verificar que ticketActual esté definido (ya validado arriba)
          console.log('Usando ticket actual para crear ticket actualizado:', ticketActual.id);

          // Crear el ticket actualizado usando la función auxiliar
          const ticketActualizado = this.crearTicketCompleto(ticketActual, datosParaAPI, formValues);

          // Validar que el ticket esté completo
          if (!this.validarTicketCompleto(ticketActualizado)) {
            console.warn('El ticket actualizado puede tener propiedades faltantes:', ticketActualizado);
          }

          console.log('Ticket actualizado para emisión:', ticketActualizado);

          // Emitir el ticket actualizado
          this.btnGuardar.emit(ticketActualizado);

          // Cerrar modal
          this.close();
        } else {
          console.error('Error en la actualización:', response.body);
          // Aquí podrías mostrar un mensaje de error al usuario
        }

        this.loading = false;
      },
      error: (error) => {
        console.log('=== ERROR DE LA API ===');
        console.log('Status:', error.status);
        console.log('Status Text:', error.statusText);
        console.log('URL:', error.url);
        console.log('Error completo:', error);

        if (error.error) {
          console.log('Detalle del error:', error.error);
          if (typeof error.error === 'string') {
            console.log('Mensaje de error:', error.error);
          } else if (error.error.message) {
            console.log('Mensaje específico:', error.error.message);
          }
        }

        // Mostrar información específica para error 409
        if (error.status === 409) {
          console.log('=== ANÁLISIS ERROR 409 (CONFLICT) ===');
          console.log('Posibles causas:');
          console.log('1. El servicio ya fue modificado por otro usuario');
          console.log('2. Los datos enviados no cumplen alguna validación del backend');
          console.log('3. Conflicto de concurrencia en la base de datos');
          console.log('4. El idNoConformidad o idCodigoNC no coinciden');
          console.log('=====================================');

          // Verificar datos específicos que podrían causar conflicto
          console.log('Verificación de datos críticos:');
          console.log('- cPerCodigo:', datosParaAPI.cPerCodigo);
          console.log('- idNoConformidad:', datosParaAPI.idNoConformidad);
          console.log('- idCodigoNC:', datosParaAPI.idCodigoNC);
          console.log('- idCategoria:', datosParaAPI.idCategoria);
          console.log('- idPrioridad:', datosParaAPI.idPrioridad);
        }

        console.log('======================');

        this.loading = false;

        // Aquí podrías mostrar un mensaje de error específico al usuario
        // Por ejemplo: this._messageService.add({severity:'error', summary: 'Error', detail: 'No se pudo actualizar el servicio'});
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
   * Convertir la etiqueta de prioridad a su valor numérico para la API
   */
  private obtenerValorPrioridad(etiquetaPrioridad: string): string {
    switch (etiquetaPrioridad) {
      case 'Alta': return '1';
      case 'Media': return '2';
      case 'Baja': return '3';
      default: return '2'; // Valor por defecto: Media
    }
  }

  /**
   * Validar y asegurar que el ticket tenga todas las propiedades requeridas
   */
  private validarTicketCompleto(ticket: Ticket | null): ticket is Ticket {
    if (!ticket) {
      console.error('Ticket es null o undefined');
      return false;
    }

    const validaciones = {
      id: !!ticket.id,
      areaDestino: !!ticket.areaDestino,
      estado: !!ticket.estado,
      fechaRegistro: !!ticket.fechaRegistro,
      categoria: !!ticket.categoria,
      prioridad: !!ticket.prioridad,
      detalle: !!ticket.detalle
      // CAMBIO: No validamos fecha y lugar como requeridos ya que son opcionales
    };

    const camposFaltantes = Object.entries(validaciones)
      .filter(([key, valid]) => !valid)
      .map(([key]) => key);

    if (camposFaltantes.length > 0) {
      console.warn('Campos faltantes en el ticket:', camposFaltantes);
      return false;
    }

    return true;
  }

  /**
   * Crear un ticket completo con valores por defecto para propiedades faltantes
   */
  private crearTicketCompleto(ticketBase: Ticket, datosAPI: any, formValues: any): Ticket {
    // Asegurar que ticketBase no sea null
    if (!ticketBase) {
      throw new Error('ticketBase no puede ser null');
    }

    return {
      id: ticketBase.id || '',
      idNoConformidad: ticketBase.idNoConformidad || 0,
      fecha: datosAPI.dfechaIncidente || '', // Puede ser cadena vacía
      areaDestino: ticketBase.areaDestino || 'Sin especificar',
      categoria: this.obtenerDescripcionCategoria(datosAPI.idCategoria),
      prioridad: formValues.prioridad || 'Media',
      estado: ticketBase.estado || 'Pendiente',
      detalle: datosAPI.cDetalleServicio || '',
      lugar: datosAPI.cLugarIncidente || '', // Puede ser cadena vacía
      fechaRegistro: ticketBase.fechaRegistro || new Date().toLocaleDateString()
    };
  }

  /**
   * Reintentar la carga de categorías (útil si falló la primera vez)
   */
  reintentarCargaCategorias(): void {
    if (!this.loadingCategorias) {
      console.log('Reintentando carga de categorías...');
      this.cargarCategorias();
    }
  }

  /**
   * Verificar la configuración del endpoint
   */
  private verificarConfiguracionEndpoint(): boolean {
    try {
      const apiConfig = (this._mainService as any)['ApiServicioNC'];
      if (!apiConfig) {
        console.error('Configuración ApiServicioNC no encontrada');
        return false;
      }

      if (!apiConfig.url) {
        console.error('URL base de ApiServicioNC no configurada');
        return false;
      }

      if (!apiConfig.endpoints || !apiConfig.endpoints.Snc_EditarIncidencias) {
        console.error('Endpoint Snc_EditarIncidencias no configurado');
        console.log('Endpoints disponibles:', Object.keys(apiConfig.endpoints || {}));
        return false;
      }

      const urlCompleta = apiConfig.url + apiConfig.endpoints.Snc_EditarIncidencias;
      console.log('URL completa del endpoint:', urlCompleta);

      return true;
    } catch (error) {
      console.error('Error al verificar configuración del endpoint:', error);
      return false;
    }
  }
}