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
      lugar: servicio.descripcionNC || 'No especificado',
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
   * Corrige el problema de interpretación de formatos de fecha
   */
  private formatearSoloFecha(fecha: string | null): string {
    if (!fecha) return '';

    try {
      let fechaObj: Date;

      // Si la fecha viene en formato ISO desde la base de datos (2025-04-02 00:00:00.000)
      if (fecha.includes('-') && (fecha.includes(':') || fecha.includes('T'))) {
        // Formato ISO: usar directamente
        fechaObj = new Date(fecha);
      }
      // Si la fecha viene como "22/05/2025 11:14:13 AM" o "05/22/2025 11:14:13"
      else if (fecha.includes('/')) {
        // Extraer solo la parte de fecha
        const soloFecha = fecha.split(' ')[0];
        const partes = soloFecha.split('/');

        // Verificar si tenemos 3 partes
        if (partes.length === 3) {
          // Determinar el formato basándose en el contexto o valores
          let dia: number, mes: number, año: number;

          // Si el primer número es mayor a 12, asumimos formato dd/mm/yyyy
          if (parseInt(partes[0]) > 12) {
            dia = parseInt(partes[0]);
            mes = parseInt(partes[1]) - 1; // Los meses en JS van de 0-11
            año = parseInt(partes[2]);
          }
          // Si el segundo número es mayor a 12, asumimos formato mm/dd/yyyy
          else if (parseInt(partes[1]) > 12) {
            mes = parseInt(partes[0]) - 1;
            dia = parseInt(partes[1]);
            año = parseInt(partes[2]);
          }
          // Si ambos son <= 12, necesitamos otra lógica o asumir un formato
          else {
            // Por defecto, asumimos formato dd/mm/yyyy (formato español)
            dia = parseInt(partes[0]);
            mes = parseInt(partes[1]) - 1;
            año = parseInt(partes[2]);
          }

          fechaObj = new Date(año, mes, dia);
        } else {
          // Fallback: intentar parsear directamente
          fechaObj = new Date(fecha);
        }
      } else {
        fechaObj = new Date(fecha);
      }

      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        console.warn('Fecha inválida detectada:', fecha);
        return fecha.split(' ')[0] || fecha;
      }

      // Devolver la fecha en formato dd/mm/yyyy (formato español)
      const dia = fechaObj.getDate().toString().padStart(2, '0');
      const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
      const año = fechaObj.getFullYear();

      return `${dia}/${mes}/${año}`;

    } catch (error) {
      console.warn('Error al formatear fecha:', fecha, error);
      return fecha.split(' ')[0] || fecha;
    }
  }

  /**
   * Método alternativo más robusto para casos específicos
   * Úsalo si el anterior no resuelve completamente el problema
   */
  private formatearFechaDesdeISO(fecha: string | null): string {
    if (!fecha) return '';

    try {
      // Si viene en formato ISO desde SQL Server (2025-04-02 00:00:00.000)
      if (fecha.includes('-')) {
        // Extraer solo la parte de fecha (antes del espacio o T)
        const fechaSolo = fecha.split(' ')[0].split('T')[0];
        const [año, mes, dia] = fechaSolo.split('-');

        // Crear fecha específicamente con los valores extraídos
        const fechaObj = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));

        if (isNaN(fechaObj.getTime())) {
          return fechaSolo;
        }

        // Formatear como dd/mm/yyyy
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${año}`;
      }

      // Para otros formatos, usar el método anterior
      return this.formatearSoloFecha(fecha);

    } catch (error) {
      console.warn('Error al formatear fecha ISO:', fecha, error);
      return fecha;
    }
  }

  /**
   * Método para debugging - ayuda a identificar el formato de fecha recibido
   */
  private debugFecha(fecha: string, origen: string): void {
    console.log(`=== DEBUG FECHA (${origen}) ===`);
    console.log('Fecha original:', fecha);
    console.log('Contiene "-":', fecha.includes('-'));
    console.log('Contiene "/":', fecha.includes('/'));
    console.log('Contiene ":":', fecha.includes(':'));

    if (fecha.includes('/')) {
      const partes = fecha.split(' ')[0].split('/');
      console.log('Partes separadas por "/":', partes);
    }

    if (fecha.includes('-')) {
      const partes = fecha.split(' ')[0].split('T')[0].split('-');
      console.log('Partes separadas por "-":', partes);
    }

    console.log('================================');
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

  // Método para guardar cambios de un ticket - VERSIÓN MEJORADA
  guardarCambios(ticketEditado: Ticket): void {
    console.log('Guardando cambios del ticket editado:', ticketEditado);

    // Actualizar los arrays locales con el ticket editado
    const index = this.tickets.findIndex(t => t.id === ticketEditado.id);

    if (index !== -1) {
      // Actualizar el ticket en el array original
      this.tickets[index] = { ...ticketEditado };

      // Actualizar también en tickets filtrados si existe
      const indexFiltrado = this.ticketsFiltrados.findIndex(t => t.id === ticketEditado.id);
      if (indexFiltrado !== -1) {
        this.ticketsFiltrados[indexFiltrado] = { ...ticketEditado };
      }

      // También actualizar selectedTicket si es el mismo ticket
      if (this.selectedTicket && this.selectedTicket.id === ticketEditado.id) {
        this.selectedTicket = { ...ticketEditado };
      }

      console.log('Ticket actualizado exitosamente en arrays locales');

      // Opcional: Recargar datos desde el servidor para asegurar consistencia
      // Descomenta la siguiente línea si quieres recargar los datos después de editar
      // this.cargarServiciosNoConformes();
    } else {
      console.error('No se encontró el ticket para actualizar:', ticketEditado.id);
    }

    // Cerrar el modal de edición
    this.modalEdicionVisible = false;

    // Opcional: Mostrar mensaje de éxito
    // this._messageService.add({severity:'success', summary: 'Éxito', detail: 'Servicio actualizado correctamente'});
  }

  // Método auxiliar para debug - verificar datos del ticket
  private debugTicketData(ticket: Ticket): void {
    console.log('=== DEBUG TICKET DATA ===');
    console.log('ID:', ticket.id);
    console.log('idNoConformidad:', ticket.idNoConformidad);
    console.log('fecha:', ticket.fecha);
    console.log('categoria:', ticket.categoria);
    console.log('prioridad:', ticket.prioridad);
    console.log('detalle:', ticket.detalle);
    console.log('lugar:', ticket.lugar);
    console.log('=========================');
  }

  // Método mejorado para editar ticket con más validaciones
  editarTicket(ticket: Ticket): void {
    console.log('Editando ticket:', ticket);
    this.debugTicketData(ticket);

    // Asegurar que el ticket tenga el idNoConformidad
    if (!ticket.idNoConformidad) {
      console.error('No se puede editar: falta idNoConformidad');
      // Opcional: Mostrar mensaje de error al usuario
      return;
    }

    this.ticketEnEdicion = { ...ticket }; // Crear copia para evitar referencias
    this.modalEdicionVisible = true;
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