import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { VerTicketComponent } from "../../../shared/modales/ver-ticket/ver-ticket.component";
import { EditarTicketComponent } from '../../../shared/modales/editar-ticket/editar-ticket.component';
import { EliminarTicketComponent } from '../../../shared/modales/eliminar-ticket/eliminar-ticket.component';
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

// Nueva interfaz para los datos de la API (actualizada según la estructura real)
interface ServicioNoConforme {
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

type EstadoFiltro = 'Todos' | 'Pendiente' | 'En Revisión' | 'Cerrado' | 'Derivado';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, Button, TableModule, VerTicketComponent, EditarTicketComponent, EliminarTicketComponent],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent implements OnInit {
  private _mainService = inject(MainService);
  private _mainSharedService = inject(MainSharedService);

  public tickets: Ticket[] = [];
  public ticketsFiltrados: Ticket[] = [];
  public searchTerm: string = '';
  public estadoFiltro: EstadoFiltro = 'Todos';
  public loading: boolean = false;
  public error: string = '';

  // Modal de vista
  public modalVisible: boolean = false;
  public selectedTicket: Ticket | null = null;

  // Modal de edición
  public modalEdicionVisible: boolean = false;
  public ticketEnEdicion: Ticket | null = null;

  public listadoTicket: Ticket[] = [];
  public filteredTicket: Ticket[] = [];

  // Modal de eliminación
  public modalEliminacionVisible: boolean = false;
  public ticketAEliminar: Ticket | null = null;

  constructor() {
    // Usar effect para reaccionar a cambios en cPerCodigo
    effect(() => {
      const cPerCodigo = this._mainSharedService.cPerCodigo();
      if (cPerCodigo !== '') {
        console.log('cPerCodigo disponible:', cPerCodigo);
        this.cargarServiciosNoConformes();
      }
    });
  }

  ngOnInit(): void {
    // Si ya tenemos cPerCodigo al momento del init, cargar datos
    const cPerCodigo = this._mainSharedService.cPerCodigo();
    if (cPerCodigo !== '') {
      this.cargarServiciosNoConformes();
    }
  }

  /**
   * Método para cargar los servicios no conformes desde la API
   */
  cargarServiciosNoConformes(): void {
    this.loading = true;
    this.error = '';

    const cPerCodigo = this._mainSharedService.cPerCodigo();

    if (!cPerCodigo) {
      this.error = 'No se ha identificado el usuario';
      this.loading = false;
      return;
    }

    // Usar el método específico para obtener el listado de servicios no conformes
    this._mainService.post_ObtenerListadoServiciosNC(cPerCodigo).subscribe({
      next: (response) => {
        if (response.body?.lstItem) {
          const serviciosApi = response.body.lstItem as ServicioNoConforme[];
          this.tickets = this.mapearServiciosATickets(serviciosApi);
          this.ticketsFiltrados = [...this.tickets];
          console.log('Servicios cargados:', this.tickets.length);
        } else {
          this.error = 'No se pudieron cargar los servicios no conformes';
          this.tickets = [];
          this.ticketsFiltrados = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar servicios no conformes:', err);
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  /**
   * Método para mapear los datos de la API al formato de interfaz Ticket
   */
  private mapearServiciosATickets(servicios: ServicioNoConforme[]): Ticket[] {
    return servicios.map(servicio => ({
      id: servicio.cCodigoServ,
      idNoConformidad: servicio.idNoConformidad,
      fecha: this.formatearSoloFecha(servicio.dFechaFinal), // Cambiar para usar solo dFechaFinal
      areaDestino: servicio.cAreaDestino || servicio.cUniOrgNombre,
      categoria: servicio.descripcionCat,
      prioridad: this.mapearPrioridad(servicio.cPrioridad),
      estado: this.mapearEstado(servicio.cEstado),
      detalle: servicio.detalleServicioNC || servicio.descripcionNC || '',
      lugar: servicio.cAreaDestino || 'No especificado',
      fechaRegistro: this.formatearSoloFecha(servicio.fechaRegistro || servicio.dFechaFinal)
    }));
  }

  /**
   * Método para mapear la prioridad de la API al formato esperado
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
   * Método para mapear el estado de la API al formato esperado
   */
  private mapearEstado(estado: string): 'Pendiente' | 'En Revisión' | 'Cerrado' | 'Derivado' {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
      case 'en revision':
        return 'En Revisión';
      case 'cerrado':
        return 'Cerrado';
      case 'derivado':
        return 'Derivado';
      default:
        return 'Pendiente';
    }
  }

  /**
   * Método específico para formatear solo la fecha (sin hora) para el listado
   */
  private formatearSoloFecha(fecha: string | null): string {
    if (!fecha) return '';

    try {
      let fechaObj: Date;

      // Si la fecha viene como "22/05/2025 11:14:13 AM" o "05/22/2025 11:14:13"
      if (fecha.includes('/')) {
        // Remover la parte de hora y AM/PM para obtener solo la fecha
        const soloFecha = fecha.split(' ')[0]; // Obtiene solo la parte de fecha
        fechaObj = new Date(soloFecha);
      } else {
        fechaObj = new Date(fecha);
      }

      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        // Si no se puede parsear, intentar extraer solo la parte de fecha del string original
        return fecha.split(' ')[0] || fecha;
      }

      // Devolver solo la fecha en formato dd/mm/yyyy
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error al formatear fecha:', fecha, error);
      // Si hay error, devolver solo la parte de fecha del string original
      return fecha.split(' ')[0] || fecha;
    }
  }

  /**
   * Método para recargar los datos
   */
  recargarDatos(): void {
    this.cargarServiciosNoConformes();
  }

  // Método principal para filtrar tickets
  filtrarTickets(): void {
    // Primero filtramos por el estado
    let resultados = this.tickets;

    if (this.estadoFiltro !== 'Todos') {
      resultados = this.tickets.filter(ticket => ticket.estado === this.estadoFiltro);
    }

    // Luego filtramos por término de búsqueda si existe
    if (this.searchTerm && this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase().trim();
      resultados = resultados.filter(ticket =>
        ticket.id.toLowerCase().includes(termino) ||
        ticket.fecha.toLowerCase().includes(termino) ||
        ticket.areaDestino.toLowerCase().includes(termino) ||
        ticket.categoria.toLowerCase().includes(termino) ||
        ticket.prioridad.toLowerCase().includes(termino) ||
        ticket.estado.toLowerCase().includes(termino)
      );
    }

    this.ticketsFiltrados = resultados;
  }

  // Método para ver detalles del ticket
  verDetalles(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.modalVisible = true;
  }

  // Método para editar ticket
  editarTicket(ticket: Ticket): void {
    this.ticketEnEdicion = ticket;
    this.modalEdicionVisible = true;
  }

  // Método para mostrar modal de confirmación de eliminación
  confirmarEliminarTicket(ticket: Ticket): void {
    this.ticketAEliminar = ticket;
    this.modalEliminacionVisible = true;
  }

  // Método para cerrar modal de visualización
  closeModal(): void {
    this.modalVisible = false;
  }

  // Método para cerrar modal de edición
  closeModalEdicion(): void {
    this.modalEdicionVisible = false;
  }

  // Método para cerrar modal de eliminación
  closeModalEliminacion(): void {
    this.modalEliminacionVisible = false;
  }

  // Método para guardar cambios de un ticket
  guardarCambios(): void {
      // Cerrar el modal de edición
      this.modalEdicionVisible = false;

  }

  // Método para eliminar un ticket (ejecutado después de confirmar)
  eliminarTicket(ticket: Ticket): void {
    const cPerCodigo = this._mainSharedService.cPerCodigo();

    if (!cPerCodigo) {
      console.error('No se ha identificado el usuario');
      this.modalEliminacionVisible = false;
      return;
    }

    // Usar el idNoConformidad si está disponible, sino intentar convertir el ID
    let idNoConformidad: number;

    if (ticket.idNoConformidad) {
      idNoConformidad = ticket.idNoConformidad;
    } else {
      // Intentar convertir el ID del ticket a número
      idNoConformidad = parseInt(ticket.id);
      if (isNaN(idNoConformidad)) {
        console.error('No se pudo determinar el ID de no conformidad para el ticket:', ticket.id);
        this.modalEliminacionVisible = false;
        return;
      }
    }

    // Llamar al servicio de eliminación
    this._mainService.put_EliminarServicioNC(cPerCodigo, idNoConformidad).subscribe({
      next: (response) => {
        console.log('Respuesta de eliminación:', response);

        // Verificar si la eliminación fue exitosa
        if (response.status === 200) {
          // Eliminar de los arrays locales
          this.tickets = this.tickets.filter(t => t.id !== ticket.id);
          this.ticketsFiltrados = this.ticketsFiltrados.filter(t => t.id !== ticket.id);

          console.log('Ticket eliminado exitosamente');
        } else {
          console.error('Error en la eliminación:', response.body);
        }

        // Cerrar modal
        this.modalEliminacionVisible = false;
      },
      error: (error) => {
        console.error('Error al eliminar ticket:', error);
        this.modalEliminacionVisible = false;

        // Opcional: Mostrar mensaje de error al usuario
        // this.mostrarNotificacionError('No se pudo eliminar el ticket');
      }
    });
  }
}