import { Component, OnInit , effect, inject } from '@angular/core';
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

type EstadoFiltro = 'Todos' | 'Pendiente' | 'En Revisión' | 'Cerrado' | 'Derivado';

@Component({
  selector: 'app-vista-area',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, Button, TableModule, VerTicketComponent, GestionarTicketComponent, ProcesoTicketComponent],
  templateUrl: './vista-area.component.html',
  styleUrl: './vista-area.component.scss'
})
export class VistaAreaComponent  implements OnInit {
  private _mainService = inject(MainService);
  private _mainSharedService = inject(MainSharedService);

  public ticketsFiltrados: Ticket[] = [];
  public searchTerm: string = '';
  public estadoFiltro: EstadoFiltro = 'Todos';

  // Lista completa sin filtros (privada, solo para uso interno)
  private ticketsOriginales: Ticket[] = [];

  // Modal de vista
  public modalVisible: boolean = false;
  public selectedTicket: Ticket | null = null;

  // Modal de gestión
  public modalGestionVisible: boolean = false;
  public selectedTicketGestion: Ticket | null = null;

  // Modal de proceso
  public modalProcesoVisible: boolean = false;
  public selectedTicketProceso: Ticket | null = null;

  public listadoTicket: Ticket[] = [];
  public filteredTicket: Ticket[] = [];

  constructor() {
    // Usar effect para monitorear cambios en cPerCodigo
    effect(() => {
      const cPerCodigo = this._mainSharedService.cPerCodigo();
      console.log('cPerCodigo en vista-coordinador:', cPerCodigo);

      if (cPerCodigo && cPerCodigo !== '') {
        this.cargarTicketsDesdeAPI();
      }
    });
  }

  ngOnInit(): void {
    // Si ya tenemos cPerCodigo al inicializar, cargar los tickets
    const cPerCodigo = this._mainSharedService.cPerCodigo();
    if (cPerCodigo && cPerCodigo !== '') {
      this.cargarTicketsDesdeAPI();
    }
  }

  // Método para cargar tickets desde la API
  cargarTicketsDesdeAPI(): void {
    const cPerCodigo = this._mainSharedService.cPerCodigo();
    const nTipoGestion = 11; // Valor por defecto para Coordinador

    console.log('Cargando tickets con:', { cPerCodigo, nTipoGestion });

    this._mainService.post_SeguimientoServicioNC(cPerCodigo, nTipoGestion).subscribe({
      next: (response) => {
        console.log('Respuesta de la API:', response);

        if (response.body?.lstItem && response.body.lstItem.length > 0) {
          const ticketsAPI: Ticket[] = response.body.lstItem;

          // Mapear los datos de la API y guardar como originales
          this.ticketsOriginales = ticketsAPI.map(item => this.mapearTicketDeAPI(item));

          // Inicializar tickets filtrados
          this.ticketsFiltrados = [...this.ticketsOriginales];

          console.log('Tickets cargados:', this.ticketsOriginales.length);
        } else {
          console.warn('No se encontraron tickets en la respuesta');
          this.ticketsOriginales = [];
          this.ticketsFiltrados = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar tickets:', error);
        this.ticketsOriginales = [];
        this.ticketsFiltrados = [];
      }
    });
  }

  // Método para mapear los datos de la API al formato del componente
  private mapearTicketDeAPI(item: Ticket): Ticket {
    return {
      ...item,
      fechaIncidente: this.formatearFecha(item.fechaIncidente),
      fechaRegistro: this.formatearFecha(item.fechaRegistro)
    };
  }

  // Método para formatear fechas de la API
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

  // Método que se ejecuta cuando se escribe en el campo de búsqueda
  buscarPorTermino(): void {
    this.filtrarTickets();
  }

  // Método para limpiar la búsqueda
  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.estadoFiltro = 'Todos';
    this.ticketsFiltrados = [...this.ticketsOriginales];
  }

  buscarTicket(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase();

    this.filteredTicket = this.listadoTicket.filter(ticket =>
      ticket.cAreaDestino.toLowerCase().includes(value) ||
      ticket.descripcion.toLowerCase().includes(value) ||
      ticket.cEstado.toLowerCase().includes(value)
    );
  }

  // Método principal para filtrar tickets
  filtrarTickets(): void {
    // Primero filtramos por el estado
    let resultados = this.ticketsOriginales;

    if (this.estadoFiltro !== 'Todos') {
      resultados = this.ticketsOriginales.filter(ticket => ticket.cEstado === this.estadoFiltro);
    }

    // Luego filtramos por término de búsqueda si existe
    if (this.searchTerm && this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase().trim();
      resultados = resultados.filter(ticket =>
        ticket.idCodigoNC.toLowerCase().includes(termino) ||
        ticket.fechaIncidente.toLowerCase().includes(termino) ||
        ticket.cAreaDestino.toLowerCase().includes(termino) ||
        ticket.descripcion.toLowerCase().includes(termino) ||
        ticket.cPrioridad.toLowerCase().includes(termino) ||
        ticket.cEstado.toLowerCase().includes(termino)
      );
    }

    this.ticketsFiltrados = resultados;
  }

  cambiarFiltroEstado(estado: EstadoFiltro): void {
    this.estadoFiltro = estado;
    this.filtrarTickets();
  }

  // Método para ver detalles del ticket
  verDetalles(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.modalVisible = true;
  }

  // Método para ver gestion del ticket
  gestionarTicket(ticket: Ticket): void {
    this.selectedTicketGestion = ticket;
    this.modalGestionVisible = true;
  }

  // Método para cerrar modal de visualización
  closeModal(): void {
    this.modalVisible = false;
  }

  // Método para cerrar modal de gestión
  closeGestionModal(): void {
    this.modalGestionVisible = false;
    this.selectedTicketGestion = null;
  }

  // Método para abrir modal de proceso
  abrirModalProceso(ticket: Ticket): void {
    this.selectedTicketProceso = ticket;
    this.modalProcesoVisible = true;
  }

  cerrarModalProceso(): void {
    this.modalProcesoVisible = false;
    this.selectedTicketProceso = null;
  }

  // Método para refrescar los datos
  refrescarDatos(): void {
    this.cargarTicketsDesdeAPI();
  }
}
