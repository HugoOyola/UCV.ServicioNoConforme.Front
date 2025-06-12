import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { VerTicketComponent } from "../../../../shared/modales/ver-ticket/ver-ticket.component";
import { GestionarTicketComponent } from '../../../../shared/modales/gestionar-ticket/gestionar-ticket.component';
import { ProcesoTicketComponent } from '../../../../shared/modales/proceso-ticket/proceso-ticket.component';
import { MainSharedService } from '@shared/services/main-shared.service';
import { MainService } from 'src/app/page/main/services/main.service';

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
}

interface EstadisticasPrioridad {
  total: number;
  alta: number;
  media: number;
  baja: number;
}

type EstadoFiltro = 'Todos' | 'Pendiente' | 'En Revisión' | 'Cerrado' | 'Derivado';

@Component({
  selector: 'app-vista-area',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    Button,
    Tooltip,
    TableModule,
    VerTicketComponent,
    GestionarTicketComponent,
    ProcesoTicketComponent
  ],
  templateUrl: './vista-area.component.html',
  styleUrl: './vista-area.component.scss'
})
export class VistaAreaComponent implements OnInit {

  // ==================== SERVICIOS ====================
  private _mainService = inject(MainService);
  private _mainSharedService = inject(MainSharedService);

  // ==================== PROPIEDADES PÚBLICAS ====================
  public ticketsFiltrados: Ticket[] = [];
  public searchTerm: string = '';
  public estadoFiltro: EstadoFiltro = 'Todos';
  public estadisticas: EstadisticasPrioridad = { total: 0, alta: 0, media: 0, baja: 0 };

  // Agregar propiedad para controlar el estado de carga
  public cargandoDatos: boolean = false;

  // Array de estados para el template
  public estadosDisponibles: EstadoFiltro[] = [
    'Todos', 'Pendiente', 'En Revisión', 'Cerrado', 'Derivado'
  ];

  // Modales
  public modalVisible: boolean = false;
  public modalGestionVisible: boolean = false;
  public modalProcesoVisible: boolean = false;

  // Tickets seleccionados para modales
  public selectedTicket: Ticket | null = null;
  public selectedTicketGestion: Ticket | null = null;
  public selectedTicketProceso: Ticket | null = null;

  // ==================== PROPIEDADES PRIVADAS ====================
  private ticketsOriginales: Ticket[] = [];
  private nTipoGestion = 11; // Valor específico para el Area

  // ==================== CONSTRUCTOR ====================
  constructor() {
    // Monitorear cambios en cPerCodigo
    effect(() => {
      const cPerCodigo = this._mainSharedService.cPerCodigo();
      console.log('cPerCodigo actualizado en vista-coordinador:', cPerCodigo);

      if (cPerCodigo && cPerCodigo !== '') {
        this.cargarTicketsDesdeAPI();
      }
    });
  }

  // ==================== LIFECYCLE HOOKS ====================
  ngOnInit(): void {
    const cPerCodigo = this._mainSharedService.cPerCodigo();
    if (cPerCodigo && cPerCodigo !== '') {
      this.cargarTicketsDesdeAPI();
    }
  }

  // ==================== MÉTODOS DE CARGA DE DATOS ====================

  // Carga los tickets desde la API
  cargarTicketsDesdeAPI(): void {
    const cPerCodigo = this._mainSharedService.cPerCodigo();

    if (!cPerCodigo) {
      console.warn('No hay código de persona disponible');
      return;
    }

    console.log('Cargando tickets con:', {
      cPerCodigo,
      nTipoGestion: this.nTipoGestion
    });

    // Activar loader antes de la llamada
    this.cargandoDatos = true;

    this._mainService.post_SeguimientoServicioNC(cPerCodigo, this.nTipoGestion)
      .subscribe({
        next: (response) => {
          this.procesarRespuestaAPI(response);
          this.cargandoDatos = false; // Desactivar loader después de procesar
        },
        error: (error) => {
          this.manejarErrorCarga(error);
          this.cargandoDatos = false; // Desactivar loader en caso de error
        }
      });
  }

  // Procesa la respuesta de la API
  private procesarRespuestaAPI(response: any): void {
    console.log('Respuesta completa de la API:', response);

    if (response.body?.lstItem && response.body.lstItem.length > 0) {
      console.log('Datos originales de la API:', response.body.lstItem);

      // Mapear los tickets
      this.ticketsOriginales = response.body.lstItem.map((item: any) =>
        this.mapearTicketDeAPI(item)
      );

      // ✅ NUEVO: Actualizar el signal con los datos originales de la API
      this._mainSharedService.actualizarDatosSeguimiento(
        response.body.lstItem,
        this.nTipoGestion
      );

      console.log('Tickets mapeados:', this.ticketsOriginales);
      this.inicializarDatos();
      console.log('Tickets cargados exitosamente:', this.ticketsOriginales.length);
    } else {
      console.warn('No se encontraron tickets en la respuesta');
      this.reiniciarDatos();
    }
  }

  // Maneja errores en la carga de datos
  private manejarErrorCarga(error: any): void {
    console.error('Error al cargar tickets:', error);
    this.reiniciarDatos();
  }

  /**
   * Inicializa los datos después de cargar los tickets
   */
  private inicializarDatos(): void {
    this.ticketsFiltrados = [...this.ticketsOriginales];
    this.calcularEstadisticas();
  }

  /**
   * Reinicia todos los datos
   */
  private reiniciarDatos(): void {
    this.ticketsOriginales = [];
    this.ticketsFiltrados = [];
    this.estadisticas = { total: 0, alta: 0, media: 0, baja: 0 };

    // ✅ NUEVO: Limpiar los signals
    this._mainSharedService.limpiarDatosSeguimiento();
  }

  // ==================== MÉTODOS DE MAPEO Y FORMATEO ====================

  /**
   * Mapea los datos de la API al formato del componente
   */
  private mapearTicketDeAPI(item: any): Ticket {
    console.log('Mapeando item individual:', item);

    // Si fechaIncidente es null, usar fechaRegistro
    const fechaIncidenteFormateada = item.fechaIncidente
      ? this.formatearFecha(item.fechaIncidente)
      : this.formatearFecha(item.fechaRegistro);

    const ticketMapeado: Ticket = {
      idNoConformidad: item.idNoConformidad,
      idCodigoNC: item.idCodigoNC,
      idCategoria: item.idCategoria,
      descripcion: item.descripcion,
      fechaIncidente: fechaIncidenteFormateada,
      descripcionNC: item.descripcionNC || '',
      idPrioridad: item.idPrioridad,
      cPrioridad: item.cPrioridad,
      detalleServicioNC: item.detalleServicioNC,
      cUsOrigen: item.cUsOrigen,
      cAreaOrigen: item.cAreaOrigen,
      cPuestoOrigen: item.cPuestoOrigen,
      unidadDestino: item.unidadDestino,
      cAreaDestino: item.cAreaDestino,
      cPerJuridica: item.cPerJuridica,
      cFilDestino: item.cFilDestino,
      estadoNC: item.estadoNC,
      cEstado: item.cEstado,
      fechaRegistro: this.formatearFecha(item.fechaRegistro),
      cPerCodigoDeriva: item.cPerCodigoDeriva,
      correoDeriva: item.correoDeriva,
      cUsDestino: item.cUsDestino,
      cUnidadDestino: item.cUnidadDestino,
      cCargoDestino: item.cCargoDestino
    };

    console.log('Ticket mapeado:', {
      idCodigoNC: ticketMapeado.idCodigoNC,
      fechaIncidenteOriginal: item.fechaIncidente,
      fechaIncidenteUsada: fechaIncidenteFormateada,
      fechaRegistro: ticketMapeado.fechaRegistro,
      usandoFechaRegistro: !item.fechaIncidente
    });

    return ticketMapeado;
  }

  // Formatea las fechas de la API
  private formatearFecha(fechaAPI: string): string {
    if (!fechaAPI) return '';

    try {
      // La fecha viene en formato "06/01/2025 00:00:00"
      const [fecha] = fechaAPI.split(' ');
      return fecha;
    } catch (error) {
      console.error('Error al formatear fecha:', fechaAPI, error);
      return fechaAPI;
    }
  }

  // ==================== MÉTODOS DE ESTADÍSTICAS ====================

  // Calcula las estadísticas de prioridad
  calcularEstadisticas(): void {
    const tickets = this.ticketsOriginales;

    this.estadisticas = {
      total: tickets.length,
      alta: this.contarPorPrioridad(tickets, 'Alta'),
      media: this.contarPorPrioridad(tickets, 'Media'),
      baja: this.contarPorPrioridad(tickets, 'Baja')
    };
  }

  // Cuenta tickets por prioridad específica
  private contarPorPrioridad(tickets: Ticket[], prioridad: string): number {
    return tickets.filter(ticket => ticket.cPrioridad === prioridad).length;
  }

  /**
   * Obtiene las estadísticas actuales
   */
  obtenerEstadisticas(): EstadisticasPrioridad {
    return this.estadisticas;
  }

  // ==================== MÉTODOS DE FILTRADO Y BÚSQUEDA ====================

  // Realiza la búsqueda por término
  buscarPorTermino(): void {
    this.filtrarTickets();
  }

  // Limpia todos los filtros y búsquedas
  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.estadoFiltro = 'Todos';
    this.ticketsFiltrados = [...this.ticketsOriginales];
  }

  /**
   * Cambia el filtro de estado
   */
  cambiarFiltroEstado(estado: EstadoFiltro): void {
    this.estadoFiltro = estado;
    this.filtrarTickets();
  }

  /**
   * Método principal para filtrar tickets
   */
  filtrarTickets(): void {
    let resultados = [...this.ticketsOriginales];

    // Filtrar por estado
    if (this.estadoFiltro !== 'Todos') {
      resultados = resultados.filter(ticket => ticket.cEstado === this.estadoFiltro);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm && this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase().trim();
      resultados = resultados.filter(ticket => this.cumpleCriteriosBusqueda(ticket, termino));
    }

    this.ticketsFiltrados = resultados;
  }

  /**
   * Verifica si un ticket cumple con los criterios de búsqueda
   */
  private cumpleCriteriosBusqueda(ticket: Ticket, termino: string): boolean {
    const campos = [
      ticket.idCodigoNC,
      ticket.fechaIncidente,
      ticket.cAreaDestino,
      ticket.descripcion,
      ticket.cPrioridad,
      ticket.cEstado
    ];

    return campos.some(campo =>
      campo && campo.toLowerCase().includes(termino)
    );
  }

  tieneTicketsOriginales(): boolean {
    return this.ticketsOriginales.length > 0;
  }

  // ==================== MÉTODOS DE GESTIÓN DE MODALES ====================

  /**
   * Abre el modal de detalles del ticket
   */
  verDetalles(ticket: Ticket): void {
    console.log('Ver detalles del ticket:', ticket);
    this.selectedTicket = ticket;
    this.modalVisible = true;
  }

  /**
   * Abre el modal de gestión del ticket
   * Solo permite gestionar tickets que no estén en estado 'Derivado'
   */
  gestionarTicket(ticket: Ticket): void {
    // Verificar si el ticket está derivado o cerrado
    if (ticket.cEstado === 'Derivado' || ticket.cEstado === 'Cerrado') {
      console.warn('No se puede gestionar un ticket en estado:', ticket.cEstado, ticket);
      return; // Salir sin hacer nada
    }

    console.log('Gestionar ticket:', ticket);

    // ✅ NUEVO: Establecer el ticket en el signal antes de abrir el modal
    this._mainSharedService.establecerTicketEnGestion(ticket);

    this.selectedTicketGestion = ticket;
    this.modalGestionVisible = true;
  }

  /**
   * Abre el modal de proceso del ticket
   */
  abrirModalProceso(ticket: Ticket): void {
    console.log('Proceso del ticket:', ticket);
    this.selectedTicketProceso = ticket;
    this.modalProcesoVisible = true;
  }

  /**
   * Cierra el modal de visualización
   */
  closeModal(): void {
    this.modalVisible = false;
    this.selectedTicket = null;
  }

  /**
   * Cierra el modal de gestión
   */
  closeGestionModal(): void {
    this.modalGestionVisible = false;
    this.selectedTicketGestion = null;

    // ✅ NUEVO: Limpiar el ticket en gestión del signal
    this._mainSharedService.limpiarTicketEnGestion();
  }

  /**
   * Cierra el modal de proceso
   */
  cerrarModalProceso(): void {
    this.modalProcesoVisible = false;
    this.selectedTicketProceso = null;
  }

  // ==================== MÉTODOS UTILITARIOS ====================

  /**
   * Refresca todos los datos desde la API
   */
  refrescarDatos(): void {
    this.cargarTicketsDesdeAPI();
  }

  /**
   * Obtiene el número total de tickets filtrados
   */
  obtenerTotalFiltrados(): number {
    return this.ticketsFiltrados.length;
  }


  /**
   * Obtiene el tooltip apropiado para el botón de gestionar según el estado
   */
  getTooltipGestionar(estado: string): string {
    switch (estado) {
      case 'Derivado':
        return 'Ticket derivado - No se puede gestionar';
      case 'Cerrado':
        return 'Ticket cerrado - No se puede gestionar';
      default:
        return 'Gestionar ticket';
    }
  }

  /**
   * Verifica si hay tickets cargados
   */
  tieneTickets(): boolean {
    return this.ticketsOriginales.length > 0;
  }

  /**
   * Obtiene un ticket por su ID
   */
  obtenerTicketPorId(idCodigoNC: string): Ticket | undefined {
    return this.ticketsOriginales.find(ticket => ticket.idCodigoNC === idCodigoNC);
  }

  actualizarTicketEspecifico(idCodigoNC: string): void {
    // Recargar todos los datos para asegurar consistencia
    this.cargarTicketsDesdeAPI();
  }

  /**
   * Método para obtener los datos completos de un ticket para derivar
   */
  obtenerDatosParaDerivar(ticket: Ticket): any {
    const datosDerivacion = {
      cPerCodigo: this._mainSharedService.cPerCodigo(),
      idNoConformidad: ticket.idNoConformidad,
      idCodigoNC: ticket.idCodigoNC,
      cNombreUsuarioO: ticket.cUsOrigen,
      cAreaUsuarioO: ticket.cAreaOrigen,
      cPuestoUsuarioO: ticket.cPuestoOrigen,
      nUniOrgCodigoO: ticket.unidadDestino, // Unidad de origen
      cNombreCategoria: ticket.descripcion,
      dfechaIncidente: ticket.fechaIncidente,
      fechaRegistroNC: ticket.fechaRegistro,
      cLugarIncidente: ticket.descripcionNC,
      cNombrePrioridad: ticket.cPrioridad,
      cDetalleServicio: ticket.detalleServicioNC,
      cPerJuridica: ticket.cPerJuridica,
      cFilialUsuarioO: ticket.cFilDestino,
      cUsuarioCorreoO: ticket.correoDeriva,
      nUniOrgCodigoD: 0, // Se debe especificar al derivar
      comentario: '' // Se debe especificar al derivar
    };

    console.log('Datos preparados para derivación:', datosDerivacion);
    return datosDerivacion;
  }

  // Agregar estos métodos al VistaCoordinadorComponent

  /**
   * Maneja cuando un ticket ha sido derivado exitosamente
   */
  onTicketDerivado(ticketActualizado: Ticket): void {
    console.log('Ticket derivado exitosamente:', ticketActualizado);

    // Actualizar el ticket en la lista local
    const index = this.ticketsOriginales.findIndex(
      t => t.idCodigoNC === ticketActualizado.idCodigoNC
    );

    if (index !== -1) {
      this.ticketsOriginales[index] = ticketActualizado;
      this.filtrarTickets(); // Refiltrar para actualizar la vista
      this.calcularEstadisticas();
    }

    // Opcional: Recargar todos los datos desde la API para asegurar consistencia
    // this.cargarTicketsDesdeAPI();
  }

  /**
   * Maneja cuando un ticket ha sido atendido exitosamente
   */
  onTicketAtendido(ticketActualizado: Ticket): void {
    console.log('Ticket atendido exitosamente:', ticketActualizado);

    // Actualizar el ticket en la lista local
    const index = this.ticketsOriginales.findIndex(
      t => t.idCodigoNC === ticketActualizado.idCodigoNC
    );

    if (index !== -1) {
      this.ticketsOriginales[index] = ticketActualizado;
      this.filtrarTickets(); // Refiltrar para actualizar la vista
      this.calcularEstadisticas();
    }
  }
}