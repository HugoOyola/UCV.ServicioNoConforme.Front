import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
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
  descripcion: string;          // Mapear desde descripcionCat
  fechaIncidente: string;       // Formatear desde fechaIncidente o fechaRegistro
  descripcionNC: string;
  idPrioridad: number;
  cPrioridad: string;
  detalleServicioNC: string;    // Mapear desde detalleServicioNC
  cUsOrigen: string;            // Mapear desde cNombreUsuario
  cAreaOrigen: string;          // Mapear desde cDepartamento
  cPuestoOrigen: string;        // Mapear desde un campo relacionado o vacío
  unidadDestino: number;        // Mapear desde nUniOrgCodigo
  cAreaDestino: string;
  cPerJuridica: string;
  cFilDestino: string;          // Mapear desde cFilial
  estadoNC: number;
  cEstado: string;
  fechaRegistro: string;
  cPerCodigoDeriva: string;     // Mapear desde cPerCodigoSuper
  correoDeriva: string;         // Mapear desde correoSupervisor
  cUsDestino: string;           // Mapear desde cNombreSupervisor
  cUnidadDestino: string;       // Mapear desde cUniOrgNombre
  cCargoDestino: string;        // Mapear desde cCargoSupervisor
}

interface EstadisticasPrioridad {
  total: number;
  alta: number;
  media: number;
  baja: number;
}

type EstadoFiltro = 'Todos' | 'Pendiente' | 'En Revisión' | 'Cerrado' | 'Derivado';

@Component({
  selector: 'app-vista-coordinador',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    Button,
    TableModule,
    VerTicketComponent,
    GestionarTicketComponent,
    ProcesoTicketComponent
  ],
  templateUrl: './vista-coordinador.component.html',
  styleUrl: './vista-coordinador.component.scss'
})
export class VistaCoordinadorComponent implements OnInit {

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
  private nTipoGestion = 185; // Valor específico para el Coordinador

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
  // Procesa la respuesta de la API
  private procesarRespuestaAPI(response: any): void {
    console.log('=== RESPUESTA COMPLETA DE LA API ===');
    console.log('Response completo:', response);

    if (response.body?.lstItem && response.body.lstItem.length > 0) {
      console.log('=== ESTRUCTURA DE UN ITEM ===');
      console.log('Primer item completo:', response.body.lstItem[0]);

      console.log('=== TODAS LAS PROPIEDADES DISPONIBLES ===');
      const primerItem = response.body.lstItem[0];
      Object.keys(primerItem).forEach(key => {
        console.log(`${key}: ${primerItem[key]} (tipo: ${typeof primerItem[key]})`);
      });

      console.log('=== COMPARACIÓN CON INTERFAZ ACTUAL ===');
      const interfaceFields = [
        'idNoConformidad', 'idCodigoNC', 'idCategoria', 'descripcion',
        'fechaIncidente', 'descripcionNC', 'idPrioridad', 'cPrioridad',
        'detalleServicioNC', 'cUsOrigen', 'cAreaOrigen', 'cPuestoOrigen',
        'unidadDestino', 'cAreaDestino', 'cPerJuridica', 'cFilDestino',
        'estadoNC', 'cEstado', 'fechaRegistro', 'cPerCodigoDeriva',
        'correoDeriva', 'cUsDestino', 'cUnidadDestino', 'cCargoDestino'
      ];

      console.log('Campos en interfaz actual vs disponibles en API:');
      interfaceFields.forEach(field => {
        const exists = Object.prototype.hasOwnProperty.call(primerItem, field);
        console.log(`${field}: ${exists ? '✅ Existe' : '❌ No existe'} ${exists ? `(valor: ${primerItem[field]})` : ''}`);
      });

      console.log('=== CAMPOS ADICIONALES EN API NO MAPEADOS ===');
      Object.keys(primerItem).forEach(key => {
        if (!interfaceFields.includes(key)) {
          console.log(`${key}: ${primerItem[key]} (tipo: ${typeof primerItem[key]})`);
        }
      });

      // Mapear con la estructura actual (temporal)
      this.ticketsOriginales = response.body.lstItem.map((item: any) =>
        this.mapearTicketDeAPI(item)
      );

      this.inicializarDatos();
      console.log('✅ Tickets cargados exitosamente:', this.ticketsOriginales.length);
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
  }

  // ==================== MÉTODOS DE MAPEO Y FORMATEO ====================

  /**
   * Mapea los datos de la API al formato del componente
   */
  private mapearTicketDeAPI(item: any): Ticket {
    return {
      // Mapeo directo
      idNoConformidad: item.idNoConformidad,
      idCodigoNC: item.idCodigoNC,
      idCategoria: item.idCategoria,
      descripcion: item.descripcionCat || '', // "BIBLIOTECA", "ADMINISTRATIVO"
      fechaIncidente: this.formatearFecha(item.fechaIncidente || item.fechaRegistro),
      descripcionNC: item.descripcionNC || '',
      idPrioridad: item.idPrioridad,
      cPrioridad: item.cPrioridad,
      detalleServicioNC: item.detalleServicioNC || '',

      // Mapeo desde campos de usuario origen
      cUsOrigen: item.cNombreUsuario || '',
      cAreaOrigen: item.cDepartamento || '',
      cPuestoOrigen: '', // No hay campo equivalente en la API, o usar un campo relacionado

      // Mapeo de destino
      unidadDestino: item.nUniOrgCodigo || 0,
      cAreaDestino: item.cAreaDestino || '',
      cPerJuridica: item.cPerJuridica || '',
      cFilDestino: item.cFilial || '',

      // Estado
      estadoNC: item.estadoNC,
      cEstado: item.cEstado,

      // Fechas
      fechaRegistro: this.formatearFecha(item.fechaRegistro),

      // Supervisor/Derivación
      cPerCodigoDeriva: item.cPerCodigoSuper || '',
      correoDeriva: item.correoSupervisor || '',
      cUsDestino: item.cNombreSupervisor || '',
      cUnidadDestino: item.cUniOrgNombre || '',
      cCargoDestino: item.cCargoSupervisor || ''
    };
  }

  /**
   * Método alternativo si quieres usar todos los campos de la API
   */
  private mapearTicketCompletoDeAPI(item: any): any {
    return {
      ...item,
      fechaIncidente: this.formatearFecha(item.fechaIncidente),
      fechaRegistro: this.formatearFecha(item.fechaRegistro),
      dFechaFinal: this.formatearFecha(item.dFechaFinal)
    };
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
    this.selectedTicket = ticket;
    this.modalVisible = true;
  }

  /**
   * Abre el modal de gestión del ticket
   */
  gestionarTicket(ticket: Ticket): void {
    this.selectedTicketGestion = ticket;
    this.modalGestionVisible = true;
  }

  /**
   * Abre el modal de proceso del ticket
   */
  abrirModalProceso(ticket: Ticket): void {
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

  onTicketDerivado(ticketActualizado: Ticket): void {
    console.log('✅ Ticket derivado:', ticketActualizado);

    // Actualizar el ticket en la lista local
    const index = this.ticketsOriginales.findIndex(
      t => t.idNoConformidad === ticketActualizado.idNoConformidad
    );

    if (index !== -1) {
      this.ticketsOriginales[index] = ticketActualizado;
      this.filtrarTickets();
      this.calcularEstadisticas();
    }
  }

  onTicketAtendido(ticketActualizado: Ticket): void {
    console.log('✅ Ticket atendido:', ticketActualizado);

    const index = this.ticketsOriginales.findIndex(
      t => t.idNoConformidad === ticketActualizado.idNoConformidad
    );

    if (index !== -1) {
      this.ticketsOriginales[index] = ticketActualizado;
      this.filtrarTickets();
      this.calcularEstadisticas();
    }
  }
}