import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { VerTicketComponent } from "../../../shared/modales/ver-ticket/ver-ticket.component";
import { EditarTicketComponent } from '../../../shared/modales/editar-ticket/editar-ticket.component';
import { EliminarTicketComponent } from '../../../shared/modales/eliminar-ticket/eliminar-ticket.component';

interface Ticket {
  id: string;
  fecha: string;
  areaDestino: string;
  categoria: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'En Proceso' | 'Resuelto' | 'Transferido';
  detalle: string;
  lugar: string;
  fechaRegistro: string;
}

type EstadoFiltro = 'Todos' | 'Pendiente' | 'En Proceso' | 'Resuelto' | 'Transferido';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, Button, TableModule, VerTicketComponent, EditarTicketComponent, EliminarTicketComponent],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent implements OnInit {
  public tickets: Ticket[] = [];
  public ticketsFiltrados: Ticket[] = [];
  public searchTerm: string = '';
  public estadoFiltro: EstadoFiltro = 'Todos';

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

  constructor() { }

  ngOnInit(): void {
    // Inicializar datos de ejemplo
    this.tickets = [
      {
        id: "SNC-001",
        fecha: "10/05/2025",
        areaDestino: "Área Académica",
        categoria: "Servicios Académicos",
        prioridad: "Alta",
        estado: "Pendiente",
        detalle: "Problemas con el sistema de matrícula en línea. Los estudiantes no pueden completar el proceso.",
        lugar: "Laboratorio de Informática",
        fechaRegistro: "10/05/2025 08:30",
      },
      {
        id: "SNC-002",
        fecha: "08/05/2025",
        areaDestino: "Infraestructura",
        categoria: "Infraestructura",
        prioridad: "Media",
        estado: "En Proceso",
        detalle: "Fallas en el sistema de aire acondicionado del aula 302.",
        lugar: "Aula 302",
        fechaRegistro: "08/05/2025 10:15",
      },
      {
        id: "SNC-003",
        fecha: "05/05/2025",
        areaDestino: "Bienestar Universitario",
        categoria: "Atención al Usuario",
        prioridad: "Baja",
        estado: "Resuelto",
        detalle: "Demora excesiva en la atención de trámites de bienestar estudiantil.",
        lugar: "Oficina de Bienestar",
        fechaRegistro: "05/05/2025 14:20",
      },
      {
        id: "SNC-004",
        fecha: "01/05/2025",
        areaDestino: "Área Administrativa",
        categoria: "Trámites Documentarios",
        prioridad: "Alta",
        estado: "Transferido",
        detalle: "Documentos extraviados en el proceso de transferencia entre departamentos.",
        lugar: "Oficina de Trámite Documentario",
        fechaRegistro: "01/05/2025 09:45",
      },
      {
        id: "SNC-005",
        fecha: "28/04/2025",
        areaDestino: "Área de Investigación",
        categoria: "Otros",
        prioridad: "Media",
        estado: "Resuelto",
        detalle: "Retraso en la aprobación de proyectos de investigación.",
        lugar: "Dirección de Investigación",
        fechaRegistro: "28/04/2025 11:30",
      },
      {
        id: "SNC-006",
        fecha: "11/05/2025",
        areaDestino: "Área Académica",
        categoria: "Servicios Académicos",
        prioridad: "Alta",
        estado: "Pendiente",
        detalle: "Error en la asignación de cursos para el semestre entrante.",
        lugar: "Oficina de Registro Académico",
        fechaRegistro: "11/05/2025 09:00"
      },
      {
        id: "SNC-007",
        fecha: "12/05/2025",
        areaDestino: "Infraestructura",
        categoria: "Infraestructura",
        prioridad: "Media",
        estado: "En Proceso",
        detalle: "Fugas de agua en los baños del segundo piso.",
        lugar: "Edificio Principal",
        fechaRegistro: "12/05/2025 10:30"
      },
      {
        id: "SNC-008",
        fecha: "13/05/2025",
        areaDestino: "Bienestar Universitario",
        categoria: "Atención al Usuario",
        prioridad: "Baja",
        estado: "Resuelto",
        detalle: "Solicitud de ampliación del horario de atención médica.",
        lugar: "Centro de Salud Universitario",
        fechaRegistro: "13/05/2025 11:15"
      },
      {
        id: "SNC-009",
        fecha: "14/05/2025",
        areaDestino: "Área Administrativa",
        categoria: "Trámites Documentarios",
        prioridad: "Alta",
        estado: "Transferido",
        detalle: "Demora en la emisión de certificados de estudios.",
        lugar: "Oficina de Secretaría General",
        fechaRegistro: "14/05/2025 08:45"
      },
      {
        id: "SNC-010",
        fecha: "15/05/2025",
        areaDestino: "Área de Investigación",
        categoria: "Otros",
        prioridad: "Media",
        estado: "Resuelto",
        detalle: "Falta de insumos para laboratorios de investigación.",
        lugar: "Laboratorio de Ciencias",
        fechaRegistro: "15/05/2025 09:30"
      },
      {
        id: "SNC-011",
        fecha: "16/05/2025",
        areaDestino: "Área Académica",
        categoria: "Servicios Académicos",
        prioridad: "Alta",
        estado: "Pendiente",
        detalle: "Problemas con la plataforma de enseñanza virtual.",
        lugar: "Sala de Profesores",
        fechaRegistro: "16/05/2025 10:00"
      },
      {
        id: "SNC-012",
        fecha: "17/05/2025",
        areaDestino: "Infraestructura",
        categoria: "Infraestructura",
        prioridad: "Media",
        estado: "En Proceso",
        detalle: "Reparación de ventanas rotas en el aula 105.",
        lugar: "Aula 105",
        fechaRegistro: "17/05/2025 11:20"
      },
      {
        id: "SNC-013",
        fecha: "18/05/2025",
        areaDestino: "Bienestar Universitario",
        categoria: "Atención al Usuario",
        prioridad: "Baja",
        estado: "Resuelto",
        detalle: "Solicitud de actividades recreativas para estudiantes.",
        lugar: "Patio Central",
        fechaRegistro: "18/05/2025 12:10"
      },
      {
        id: "SNC-014",
        fecha: "19/05/2025",
        areaDestino: "Área Administrativa",
        categoria: "Trámites Documentarios",
        prioridad: "Alta",
        estado: "Transferido",
        detalle: "Errores en la transcripción de notas finales.",
        lugar: "Oficina de Registro Académico",
        fechaRegistro: "19/05/2025 09:50"
      },
      {
        id: "SNC-015",
        fecha: "20/05/2025",
        areaDestino: "Área de Investigación",
        categoria: "Otros",
        prioridad: "Media",
        estado: "Resuelto",
        detalle: "Solicitud de acceso a bases de datos científicas.",
        lugar: "Biblioteca Central",
        fechaRegistro: "20/05/2025 10:40"
      },
      {
        id: "SNC-016",
        fecha: "21/05/2025",
        areaDestino: "Área Académica",
        categoria: "Servicios Académicos",
        prioridad: "Alta",
        estado: "Pendiente",
        detalle: "Falta de docentes para el curso de Matemáticas II.",
        lugar: "Departamento de Matemáticas",
        fechaRegistro: "21/05/2025 11:30"
      },
      {
        id: "SNC-017",
        fecha: "22/05/2025",
        areaDestino: "Infraestructura",
        categoria: "Infraestructura",
        prioridad: "Media",
        estado: "En Proceso",
        detalle: "Mantenimiento de ascensores en el edificio B.",
        lugar: "Edificio B",
        fechaRegistro: "22/05/2025 12:20"
      },
      {
        id: "SNC-018",
        fecha: "23/05/2025",
        areaDestino: "Bienestar Universitario",
        categoria: "Atención al Usuario",
        prioridad: "Baja",
        estado: "Resuelto",
        detalle: "Solicitud de charlas sobre salud mental.",
        lugar: "Auditorio Principal",
        fechaRegistro: "23/05/2025 13:10"
      },
      {
        id: "SNC-019",
        fecha: "24/05/2025",
        areaDestino: "Área Administrativa",
        categoria: "Trámites Documentarios",
        prioridad: "Alta",
        estado: "Transferido",
        detalle: "Problemas con la emisión de constancias de estudios.",
        lugar: "Oficina de Secretaría Académica",
        fechaRegistro: "24/05/2025 09:15"
      },
      {
        id: "SNC-020",
        fecha: "25/05/2025",
        areaDestino: "Área de Investigación",
        categoria: "Otros",
        prioridad: "Media",
        estado: "Resuelto",
        detalle: "Solicitud de financiamiento para proyecto de tesis.",
        lugar: "Oficina de Investigación",
        fechaRegistro: "25/05/2025 10:05"
      },
      {
        id: "SNC-021",
        fecha: "26/05/2025",
        areaDestino: "Área Académica",
        categoria: "Servicios Académicos",
        prioridad: "Alta",
        estado: "Pendiente",
        detalle: "Inconvenientes con la inscripción de cursos electivos.",
        lugar: "Plataforma Virtual",
        fechaRegistro: "26/05/2025 11:00"
      },
      {
        id: "SNC-022",
        fecha: "27/05/2025",
        areaDestino: "Infraestructura",
        categoria: "Infraestructura",
        prioridad: "Media",
        estado: "En Proceso",
        detalle: "Reparación de techos en el pabellón C.",
        lugar: "Pabellón C",
        fechaRegistro: "27/05/2025 12:45"
      },
      {
        id: "SNC-023",
        fecha: "28/05/2025",
        areaDestino: "Bienestar Universitario",
        categoria: "Atención al Usuario",
        prioridad: "Baja",
        estado: "Resuelto",
        detalle: "Solicitud de implementación de áreas verdes.",
        lugar: "Campus Universitario",
        fechaRegistro: "28/05/2025 13:30"
      },
      {
        id: "SNC-024",
        fecha: "29/05/2025",
        areaDestino: "Área Administrativa",
        categoria: "Trámites Documentarios",
        prioridad: "Alta",
        estado: "Transferido",
        detalle: "Retrasos en la entrega de diplomas de grado.",
        lugar: "Oficina de Grados y Títulos",
        fechaRegistro: "29/05/2025 09:40"
      },
      {
        id: "SNC-025",
        fecha: "30/05/2025",
        areaDestino: "Área de Investigación",
        categoria: "Otros",
        prioridad: "Media",
        estado: "Resuelto",
        detalle: "Solicitud de asesoría para publicación en revistas científicas.",
        lugar: "Centro de Publicaciones",
        fechaRegistro: "30/05/2025 10:25"
      }
    ];

    // Inicializar tickets filtrados con todos los tickets
    this.ticketsFiltrados = [...this.tickets];
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
  guardarCambios(ticketEditado: Ticket): void {
    // Encontrar el índice del ticket en el array original
    const index = this.tickets.findIndex(t => t.id === ticketEditado.id);

    if (index !== -1) {
      // Actualizar el ticket en el array original
      this.tickets[index] = ticketEditado;

      // Actualizar también en tickets filtrados si existe
      const indexFiltrado = this.ticketsFiltrados.findIndex(t => t.id === ticketEditado.id);
      if (indexFiltrado !== -1) {
        this.ticketsFiltrados[indexFiltrado] = ticketEditado;
      }

      // También actualizar selectedTicket si es el mismo ticket
      if (this.selectedTicket && this.selectedTicket.id === ticketEditado.id) {
        this.selectedTicket = ticketEditado;
      }

      // Cerrar el modal de edición
      this.modalEdicionVisible = false;
    }
  }

  // Método para eliminar un ticket (ejecutado después de confirmar)
  eliminarTicket(ticket: Ticket): void {
    // Filtrar el ticket del array original
    this.tickets = this.tickets.filter(t => t.id !== ticket.id);
    // Actualizar tickets filtrados
    this.ticketsFiltrados = this.ticketsFiltrados.filter(t => t.id !== ticket.id);
    // Cerrar el modal de eliminación
    this.modalEliminacionVisible = false;
  }
}