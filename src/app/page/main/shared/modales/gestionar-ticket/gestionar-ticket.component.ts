import { Component, EventEmitter, Input, Output, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MainService } from '../../../services/main.service';
import { MainSharedService } from '@shared/services/main-shared.service';

// ==================== INTERFACES ====================
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
  // Campos adicionales del listado
  cCodigoServ?: string;
  nUniOrgCodigo?: number;
  cUniOrgNombre?: string;
  descripcionCat?: string;
  cPerCodigo?: string;
  cNombreUsuario?: string;
  cDepartamento?: string;
  usuarioCorreo?: string;
  cFilial?: string;
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

interface Accion {
  nombre: string;
  value: string;
}

interface AreaOption {
  name: string;
  value: number;
}

// Interfaz para las unidades académicas como vienen de la API
interface UnidadAcademica {
  nUniOrgCodigo: number;
  cUniOrgNombre: string;
  cPerJuridica: string;
  cPerApellido: string;
  nTipCur: number;
  nPrdCodigo: number;
  idFacultad: number;
}

@Component({
  selector: 'app-gestionar-ticket',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule, Select, Textarea, TooltipModule],
  templateUrl: './gestionar-ticket.component.html',
  styleUrl: './gestionar-ticket.component.scss'
})
export class GestionarTicketComponent {
  // ==================== SERVICIOS INYECTADOS ====================
  private _mainService = inject(MainService);
  private _mainSharedService = inject(MainSharedService);

  // ==================== INPUTS Y OUTPUTS ====================
  @Input() public visible: boolean = false;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();
  @Output() public ticketDerivado: EventEmitter<Ticket> = new EventEmitter<Ticket>();
  @Output() public ticketAtendido: EventEmitter<Ticket> = new EventEmitter<Ticket>();

  // ==================== COMPUTED SIGNALS ====================
  // Obtener el ticket actual desde el signal
  public ticket = computed(() => this._mainSharedService.ticketEnGestion());

  // Obtener todos los datos de seguimiento desde el signal
  public datosSeguimiento = computed(() => this._mainSharedService.datosSeguimiento());

  // ==================== PROPIEDADES PÚBLICAS ====================
  // Estados de carga
  public loading: boolean = false;
  public loadingAreas: boolean = false;

  // Propiedades para el formulario
  public selectedAction: string = '';
  public selectedArea: number | null = null;
  public comentario: string = '';

  // Opciones para los selects
  public acciones: Accion[] = [
    { nombre: 'Atender', value: 'atender' },
    { nombre: 'Derivar', value: 'derivar' }
  ];

  // Lista de áreas - ahora se carga dinámicamente desde la API
  public areas: AreaOption[] = [];

  // ==================== CONSTRUCTOR Y EFFECTS ====================
  constructor() {
    // Effect para reaccionar a cambios en el ticket
    effect(() => {
      const ticketActual = this.ticket();
      if (ticketActual) {
        console.log('Ticket actualizado en gestionar-ticket:', ticketActual);
        // Resetear el formulario cuando cambie el ticket
        this.resetForm();
      }
    });

    // Effect para reaccionar a cambios en los datos de seguimiento
    effect(() => {
      const datos = this.datosSeguimiento();
      if (datos) {
        console.log('Datos de seguimiento disponibles:', datos.tickets.length);
      }
    });
  }

  // ==================== MÉTODOS DE MODAL ====================

  /**
   * Cierra el modal y resetea el formulario
   */
  close(): void {
    this.resetForm();
    // Limpiar el ticket en gestión del signal
    this._mainSharedService.limpiarTicketEnGestion();
    this.btnCerrar.emit();
  }

  /**
   * Maneja el cambio de acción seleccionada
   */
  onActionChange(): void {
    // Limpiar el área seleccionada y comentario cuando cambia la acción
    this.selectedArea = null;
    this.comentario = '';

    // Si selecciona "derivar", cargar las áreas disponibles
    if (this.selectedAction === 'derivar') {
      this.cargarAreasParaDerivacion();
    } else {
      // Si no es derivar, limpiar las áreas
      this.areas = [];
    }
  }

  // ==================== MÉTODOS PARA CARGAR DATOS ====================

  /**
   * Carga las áreas disponibles para derivación desde la API
   */
  private cargarAreasParaDerivacion(): void {
    this.loadingAreas = true;
    this.areas = [];

    // Obtener cPerJuridica del usuario actual o del ticket
    const datosUsuario = this._mainSharedService.datosUsuario();
    const ticketActual = this.ticket();
    let cPerJuridica = datosUsuario?.cPerJuridica;

    // Si no tenemos cPerJuridica del usuario, intentar obtenerlo del ticket
    if (!cPerJuridica && ticketActual?.cPerJuridica) {
      cPerJuridica = ticketActual.cPerJuridica;
    }

    if (!cPerJuridica) {
      // Si aún no tenemos cPerJuridica, obtenerlo del servicio de detalle personal
      this._mainService.post_ObtenerServicioDetallePersonal(this._mainSharedService.cPerCodigo()).subscribe({
        next: (response) => {
          if (response.body?.lstItem && response.body.lstItem.length > 0) {
            const cPerJuridicaDetalle = response.body.lstItem[0].cPerJuridica;
            if (cPerJuridicaDetalle) {
              this.obtenerListadoEscuelasParaDerivacion(cPerJuridicaDetalle);
            } else {
              console.warn('No se encontró cPerJuridica en los datos del personal');
              this.loadingAreas = false;
            }
          } else {
            console.warn('No se encontraron datos del personal');
            this.loadingAreas = false;
          }
        },
        error: (error) => {
          console.error('Error al obtener los datos del personal:', error);
          this.loadingAreas = false;
        }
      });
    } else {
      // Si ya tenemos cPerJuridica, obtener directamente las escuelas
      this.obtenerListadoEscuelasParaDerivacion(cPerJuridica);
    }
  }

  /**
   * Obtiene el listado de escuelas/áreas para derivación con nTipoUnidad = 2
   */
  private obtenerListadoEscuelasParaDerivacion(cPerJuridica: string): void {
    const nTipoUnidad = 2; // Para derivación usamos tipo 2

    this._mainService.post_ObtenerServicioListadoEscuelas(cPerJuridica, nTipoUnidad).subscribe({
      next: (response) => {
        if (response.body?.lstItem && response.body.lstItem.length > 0) {
          const unidadesAcademicas: UnidadAcademica[] = response.body.lstItem;

          // Mapear a la estructura necesaria para el select
          this.areas = unidadesAcademicas.map(item => ({
            name: item.cUniOrgNombre,
            value: item.nUniOrgCodigo
          }));

          // Ordenar alfabéticamente las áreas
          this.areas.sort((a, b) => a.name.localeCompare(b.name));

          console.log('Áreas para derivación cargadas:', this.areas.length);
        } else {
          console.warn('No se encontraron áreas para derivación en la respuesta');
          this.areas = [];
        }
        this.loadingAreas = false;
      },
      error: (error) => {
        console.error('Error al obtener el listado de áreas para derivación:', error);
        this.areas = [];
        this.loadingAreas = false;
      }
    });
  }

  // ==================== MÉTODOS DE VALIDACIÓN ====================

  /**
   * Verifica si se puede procesar la acción
   */
  canProcess(): boolean {
    if (!this.selectedAction || !this.ticket()) {
      return false;
    }

    if (this.selectedAction === 'derivar') {
      return this.selectedArea !== null && this.selectedArea !== undefined && this.comentario.trim() !== '';
    }

    if (this.selectedAction === 'atender') {
      return this.comentario.trim() !== '';
    }

    return false;
  }

  // ==================== MÉTODOS PARA UI DINÁMICA ====================

  /**
   * Obtiene el texto del botón de procesar
   */
  getProcessButtonLabel(): string {
    if (this.selectedAction === 'derivar') {
      return 'Derivar';
    }
    return 'Procesar';
  }

  /**
   * Obtiene el icono del botón de procesar
   */
  getProcessButtonIcon(): string {
    if (this.selectedAction === 'derivar') {
      return 'pi pi-share-alt';
    }
    return 'pi pi-check';
  }

  /**
   * Obtiene la severidad del botón de procesar para PrimeNG
   */
  getProcessButtonSeverity(): 'success' | 'info' | 'secondary' {
    if (!this.canProcess()) {
      return 'secondary';
    }

    if (this.selectedAction === 'derivar') {
      return 'info';
    }

    return 'success';
  }

  // ==================== MÉTODOS DE GESTIÓN PRINCIPAL ====================

  /**
   * Método principal para gestionar el ticket
   */
  gestionar(): void {
    const ticketActual = this.ticket();
    if (this.canProcess() && ticketActual) {
      this.loading = true;

      if (this.selectedAction === 'derivar') {
        this.derivarTicket();
      } else if (this.selectedAction === 'atender') {
        this.atenderTicket();
      }
    }
  }

  /**
   * Deriva el ticket a otra área usando la API real
   */
  private derivarTicket(): void {
    const ticketActual = this.ticket();
    if (!ticketActual || !this.selectedArea) {
      this.loading = false;
      return;
    }

    console.log('Derivando ticket desde signal:', ticketActual);
    console.log('Área seleccionada:', this.selectedArea);
    console.log('Comentario:', this.comentario);

    // Obtener datos del usuario actual
    const datosUsuario = this._mainSharedService.datosUsuario();
    const cPerCodigo = this._mainSharedService.cPerCodigo();

    // Buscar los datos originales del ticket en el signal de seguimiento
    const datosSeguimiento = this.datosSeguimiento();
    let datosOriginalesTicket = null;

    if (datosSeguimiento?.tickets) {
      datosOriginalesTicket = datosSeguimiento.tickets.find(
        t => t.idCodigoNC === ticketActual.idCodigoNC
      );
    }

    // Preparar los datos para la derivación según la estructura de la API
    const datosDerivacion = {
      cPerCodigo: ticketActual.cPerCodigoDeriva,
      idNoConformidad: ticketActual.idNoConformidad,
      idCodigoNC: ticketActual.idCodigoNC,
      cNombreUsuarioO: datosOriginalesTicket?.cUsDestino,
      cAreaUsuarioO: datosOriginalesTicket?.cUnidadDestino,
      cPuestoUsuarioO: ticketActual.cCargoDestino,
      nUniOrgCodigoO: datosOriginalesTicket?.unidadDestino,
      cNombreCategoria: datosOriginalesTicket?.descripcionCat || ticketActual.descripcion,
      dfechaIncidente: ticketActual.fechaIncidente || '',
      fechaRegistroNC: ticketActual.fechaRegistro,
      cLugarIncidente: ticketActual.descripcionNC || '',
      cNombrePrioridad: ticketActual.cPrioridad,
      cDetalleServicio: ticketActual.detalleServicioNC,
      cPerJuridica: ticketActual.cPerJuridica,
      cFilialUsuarioO: datosOriginalesTicket?.cFilDestino,
      cUsuarioCorreoO: datosOriginalesTicket?.correoDeriva,
      nUniOrgCodigoD: this.selectedArea,
      comentario: this.comentario,
    };

    console.log('Datos de derivación preparados:', datosDerivacion);

    // Llamar a la API de derivación
    this._mainService.post_DerivarServicioNC(datosDerivacion).subscribe({
      next: (response) => {
        console.log('Ticket derivado exitosamente:', response);

        if (response.body?.isSuccess) {
          // Actualizar el ticket con los nuevos datos
          const ticketActualizado = {
            ...ticketActual,
            estadoNC: 3,
            cEstado: 'Derivado',
            cAreaDestino: this.areas.find(area => area.value === this.selectedArea)?.name || ticketActual.cAreaDestino,
            unidadDestino: this.selectedArea!
          };

          // Actualizar el ticket en el signal
          this._mainSharedService.establecerTicketEnGestion(ticketActualizado);

          this.ticketDerivado.emit(ticketActualizado);
          this.close();
        } else {
          console.error('Error en la respuesta de derivación:', response.body);
          // Aquí puedes mostrar un mensaje de error al usuario
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al derivar el ticket:', error);
        // Aquí puedes mostrar un mensaje de error al usuario
        this.loading = false;
      }
    });
  }

  /**
   * Atiende el ticket directamente (simulado)
   */
  private atenderTicket(): void {
    const ticketActual = this.ticket();
    if (!ticketActual) {
      this.loading = false;
      return;
    }

    console.log('Atendiendo ticket desde signal:', ticketActual);
    console.log('Comentario:', this.comentario);

    // Obtener datos del usuario actual
    const datosUsuario = this._mainSharedService.datosUsuario();
    const cPerCodigo = this._mainSharedService.cPerCodigo();

    // Buscar los datos originales del ticket en el signal de seguimiento
    const datosSeguimiento = this.datosSeguimiento();
    let datosOriginalesTicket = null;

    if (datosSeguimiento?.tickets) {
      datosOriginalesTicket = datosSeguimiento.tickets.find(
        t => t.idCodigoNC === ticketActual.idCodigoNC
      );
    }

    // Preparar los datos para el cierre según la estructura de la API
    const datosCierre = {
      cPerCodigo: cPerCodigo, // Código del usuario que está atendiendo
      idNoConformidad: ticketActual.idNoConformidad,
      nUniOrgCodigoD: ticketActual.unidadDestino,
      cPerCodigoD: ticketActual.cPerCodigoDeriva || cPerCodigo, // Código del usuario destino o el actual
      correoDeriva: ticketActual.correoDeriva,
      respuestaFinal: this.comentario
    };

    console.log('Datos de cierre preparados:', datosCierre);

    // Llamar a la API de cierre/atención
    this._mainService.post_ModificaCierreSNC(datosCierre).subscribe({
      next: (response) => {
        console.log('Ticket atendido exitosamente:', response);

        if (response.body?.isSuccess) {
          // Actualizar el ticket con los nuevos datos
          const ticketActualizado = {
            ...ticketActual,
            estadoNC: 4, // Estado cerrado
            cEstado: 'Cerrado',
            respuestaNC: this.comentario,
            dFechaFinal: new Date().toISOString().split('T')[0] // Fecha actual
          };

          // Actualizar el ticket en el signal
          this._mainSharedService.establecerTicketEnGestion(ticketActualizado);

          this.ticketAtendido.emit(ticketActualizado);
          this.close();
        } else {
          console.error('Error en la respuesta de atención:', response.body);
          // Aquí puedes mostrar un mensaje de error al usuario
          // Ejemplo: this.showErrorMessage('Error al procesar el ticket');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al atender el ticket:', error);
        // Aquí puedes mostrar un mensaje de error al usuario
        // Ejemplo: this.showErrorMessage('Error de conexión al procesar el ticket');
        this.loading = false;
      }
    });
  }

  // ==================== MÉTODOS UTILITARIOS ====================

  /**
   * Resetea el formulario a su estado inicial
   */
  private resetForm(): void {
    this.selectedAction = '';
    this.selectedArea = null;
    this.comentario = '';
    this.loading = false;
    this.loadingAreas = false;
    this.areas = [];
  }

  /**
   * Obtiene datos específicos del ticket desde el signal
   */
  obtenerDatosTicketOriginal(): any | null {
    const ticketActual = this.ticket();
    const datosSeguimiento = this.datosSeguimiento();

    if (!ticketActual || !datosSeguimiento?.tickets) {
      return null;
    }

    return datosSeguimiento.tickets.find(
      t => t.idCodigoNC === ticketActual.idCodigoNC
    );
  }
}