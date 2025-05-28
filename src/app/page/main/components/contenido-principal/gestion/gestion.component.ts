import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { VerTicketComponent } from "../../../shared/modales/ver-ticket/ver-ticket.component";
import { GestionarTicketComponent } from '../../../shared/modales/gestionar-ticket/gestionar-ticket.component';
import { SeguimientoTicketComponent } from '../../../shared/modales/seguimiento-ticket/seguimiento-ticket.component';
interface Ticket {
  id: string;
  fecha: string;
  areaDestino: string;
  categoria: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'En Revisión' | 'Cerrado' | 'Derivado';
  detalle: string;
  lugar: string;
  fechaRegistro: string;
}

type EstadoFiltro = 'Todos' | 'Pendiente' | 'En Revisión' | 'Cerrado' | 'Derivado';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, Button, TableModule, VerTicketComponent, GestionarTicketComponent, SeguimientoTicketComponent],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.scss'
})
export class GestionComponent implements OnInit {
  public tickets: Ticket[] = [];
  public ticketsFiltrados: Ticket[] = [];
  public searchTerm: string = '';
  public estadoFiltro: EstadoFiltro = 'Todos';

  // Modal de vista
  public modalVisible: boolean = false;
  public selectedTicket: Ticket | null = null;

  // Modal de gestión
  public modalGestionVisible: boolean = false;
  public selectedTicketGestion: Ticket | null = null;

  public listadoTicket: Ticket[] = [];
  public filteredTicket: Ticket[] = [];

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
        estado: "En Revisión",
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
        estado: "Cerrado",
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
        estado: "Derivado",
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
        estado: "Cerrado",
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
        estado: "En Revisión",
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
        estado: "Cerrado",
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
        estado: "Derivado",
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
        estado: "Cerrado",
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
        estado: "En Revisión",
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
        estado: "Cerrado",
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
        estado: "Derivado",
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
        estado: "Cerrado",
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
        estado: "En Revisión",
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
        estado: "Cerrado",
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
        estado: "Derivado",
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
        estado: "Cerrado",
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
        estado: "En Revisión",
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
        estado: "Cerrado",
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
        estado: "Derivado",
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
        estado: "Cerrado",
        detalle: "Solicitud de asesoría para publicación en revistas científicas.",
        lugar: "Centro de Publicaciones",
        fechaRegistro: "30/05/2025 10:25"
      }
    ];

    // Inicializar tickets filtrados con todos los tickets
    this.ticketsFiltrados = [...this.tickets];
  }

  // Método que se ejecuta cuando se escribe en el campo de búsqueda
  buscarPorTermino(): void {
    this.filtrarTickets();
  }

  // Método para limpiar la búsqueda
  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.estadoFiltro = 'Todos';
    this.ticketsFiltrados = [...this.tickets];
  }

  buscarTicket(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase();

    this.filteredTicket = this.listadoTicket.filter(ticket =>
      ticket.areaDestino.toLowerCase().includes(value) ||
      ticket.categoria.toLowerCase().includes(value) ||
      ticket.estado.toLowerCase().includes(value)
    );
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

  // En tu componente padre
  public mostrarSeguimiento = false;
  public ticketSeleccionado: Ticket | null = null;

  abrirSeguimiento(ticket: Ticket): void {
    this.ticketSeleccionado = ticket;
    this.mostrarSeguimiento = true;
  }

  cerrarSeguimiento(): void {
    this.mostrarSeguimiento = false;
  }
}
