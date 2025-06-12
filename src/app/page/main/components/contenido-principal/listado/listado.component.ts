import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { VerTicketComponent } from "../../../shared/modales/ver-ticket/ver-ticket.component";
import { EditarTicketComponent } from '../../../shared/modales/editar-ticket/editar-ticket.component';
import { EliminarTicketComponent } from '../../../shared/modales/eliminar-ticket/eliminar-ticket.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { MainService } from '../../../services/main.service';
import { MainSharedService } from '@shared/services/main-shared.service';

// Interface unificada - usando la misma nomenclatura que vista-coordinador
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
  // Campos adicionales específicos del listado (opcionales para compatibilidad)
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

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, Button, TableModule, VerTicketComponent, EditarTicketComponent, EliminarTicketComponent, DateFormatPipe],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent implements OnInit {
  private _mainService = inject(MainService);
  private _mainSharedService = inject(MainSharedService);

  public tickets: Ticket[] = [];
  public loading: boolean = false;
  public error: string = '';

  // Modal de vista
  public modalVisible: boolean = false;
  public selectedTicket: Ticket | null = null;

  // Modal de edición
  public modalEdicionVisible: boolean = false;
  public ticketEnEdicion: Ticket | null = null;

  // Modal de eliminación
  public modalEliminacionVisible: boolean = false;
  public ticketAEliminar: Ticket | null = null;

  constructor() {
    // Usar effect para reaccionar a cambios en cPerCodigo
    effect(() => {
      const cPerCodigo = this._mainSharedService.cPerCodigo();
      console.log('cPerCodigo en listado:', cPerCodigo);

      if (cPerCodigo && cPerCodigo !== '') {
        this.cargarTicketsDesdeAPI();
      }
    });
  }

  ngOnInit(): void {
    // Si ya tenemos cPerCodigo al momento del init, cargar datos
    const cPerCodigo = this._mainSharedService.cPerCodigo();
    if (cPerCodigo && cPerCodigo !== '') {
      this.cargarTicketsDesdeAPI();
    }
  }

  // Método para cargar tickets desde la API
  cargarTicketsDesdeAPI(): void {
    this.loading = true;
    this.error = '';

    const cPerCodigo = this._mainSharedService.cPerCodigo();

    if (!cPerCodigo) {
      this.error = 'No se ha identificado el usuario';
      this.loading = false;
      return;
    }

    console.log('Cargando tickets con cPerCodigo:', cPerCodigo);

    // Usar el método específico para obtener el listado de servicios no conformes
    this._mainService.post_ObtenerListadoServiciosNC(cPerCodigo).subscribe({
      next: (response) => {
        console.log('Respuesta de la API:', response);

        if (response.body?.lstItem && response.body.lstItem.length > 0) {
          const ticketsAPI: Ticket[] = response.body.lstItem;

          // Mapear los datos de la API
          this.tickets = ticketsAPI.map(item => this.mapearTicketDeAPI(item));

          console.log('Tickets cargados:', this.tickets.length);
        } else {
          console.warn('No se encontraron tickets en la respuesta');
          this.tickets = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar tickets:', error);
        this.error = 'Error al conectar con el servidor';
        this.tickets = [];
        this.loading = false;
      }
    });
  }

  // Método para mapear los datos de la API al formato del componente
  private mapearTicketDeAPI(item: any): Ticket {
    return {
      // Campos originales de vista-coordinador
      idNoConformidad: item.idNoConformidad,
      idCodigoNC: item.idCodigoNC,
      idCategoria: item.idCategoria,
      descripcion: item.descripcionCat || item.descripcion || '',
      fechaIncidente: item.fechaIncidente || item.dFechaFinal,
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
      fechaRegistro: item.fechaRegistro,
      cPerCodigoDeriva: item.cPerCodigoSuper || '',
      correoDeriva: item.correoSupervisor || '',
      cUsDestino: item.cNombreSupervisor || '',
      cUnidadDestino: item.cUniOrgNombre || '',
      cCargoDestino: item.cCargoSupervisor || '',
      // Campos adicionales específicos del listado
      cCodigoServ: item.cCodigoServ,
      nUniOrgCodigo: item.nUniOrgCodigo,
      cUniOrgNombre: item.cUniOrgNombre,
      descripcionCat: item.descripcionCat,
      cPerCodigo: item.cPerCodigo,
      cNombreUsuario: item.cNombreUsuario,
      cDepartamento: item.cDepartamento,
      usuarioCorreo: item.usuarioCorreo,
      cPerCodigoSuper: item.cPerCodigoSuper,
      cNombreSupervisor: item.cNombreSupervisor,
      cCargoSupervisor: item.cCargoSupervisor,
      correoSupervisor: item.correoSupervisor,
      nTipCur: item.nTipCur,
      tipoNC: item.tipoNC,
      nPrdCodigo: item.nPrdCodigo,
      detalleNC: item.detalleNC,
      respuestaNC: item.respuestaNC,
      dFechaFinal: item.dFechaFinal
    };
  }

  // Método para ver detalles del ticket
  verDetalles(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.modalVisible = true;
  }

  // Método para editar ticket
  editarTicket(ticket: Ticket): void {
    console.log('Editando ticket:', ticket);

    if (!ticket.idNoConformidad) {
      console.error('No se puede editar: falta idNoConformidad');
      return;
    }

    this.ticketEnEdicion = { ...ticket }; // Crear copia para evitar referencias
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
    this.selectedTicket = null;
  }

  // Método para cerrar modal de edición
  closeModalEdicion(): void {
    this.modalEdicionVisible = false;
    this.ticketEnEdicion = null;
  }

  // Método para cerrar modal de eliminación
  closeModalEliminacion(): void {
    this.modalEliminacionVisible = false;
    this.ticketAEliminar = null;
  }

  // Método para guardar cambios de un ticket
  guardarCambios(ticketEditado: Ticket): void {
    console.log('Guardando cambios del ticket editado:', ticketEditado);

    // Actualizar el array local con el ticket editado
    const index = this.tickets.findIndex(t => t.idNoConformidad === ticketEditado.idNoConformidad);

    if (index !== -1) {
      // Actualizar el ticket en el array
      this.tickets[index] = { ...ticketEditado };

      // También actualizar selectedTicket si es el mismo ticket
      if (this.selectedTicket && this.selectedTicket.idNoConformidad === ticketEditado.idNoConformidad) {
        this.selectedTicket = { ...ticketEditado };
      }

      console.log('Ticket actualizado exitosamente');
    } else {
      console.error('No se encontró el ticket para actualizar:', ticketEditado.idNoConformidad);
    }

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

    // Usar el idNoConformidad del ticket
    const idNoConformidad = ticket.idNoConformidad;

    if (!idNoConformidad) {
      console.error('No se pudo determinar el ID de no conformidad para el ticket');
      this.modalEliminacionVisible = false;
      return;
    }

    // Llamar al servicio de eliminación
    this._mainService.put_EliminarServicioNC(cPerCodigo, idNoConformidad).subscribe({
      next: (response) => {
        console.log('Respuesta de eliminación:', response);

        // Verificar si la eliminación fue exitosa
        if (response.status === 200) {
          // Eliminar del array local
          this.tickets = this.tickets.filter(t => t.idNoConformidad !== ticket.idNoConformidad);

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
      }
    });
  }

  // Método para recargar los datos
  refrescarDatos(): void {
    this.cargarTicketsDesdeAPI();
  }
}