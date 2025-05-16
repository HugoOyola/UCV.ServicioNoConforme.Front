import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';

interface Ticket {
  id: string;
  fecha: string;
  areaDestino: string;
  categoria: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'En Proceso' | 'Resuelto' | 'Transferido';
}

type EstadoFiltro = 'Todos' | 'Pendiente' | 'En Proceso' | 'Resuelto' | 'Transferido';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, Button, TableModule],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent implements OnInit {
  public tickets: Ticket[] = [];
  public ticketsFiltrados: Ticket[] = [];
  public searchTerm: string = '';
  public estadoFiltro: EstadoFiltro = 'Todos';

  public listadoTicket: Ticket[] = [];
  public filteredTicket: Ticket[] = [];

  constructor() { }

  ngOnInit(): void {
    // Inicializar datos de ejemplo
    this.tickets = [
      {
        id: 'SNC-0001',
        fecha: '10/05/2025',
        areaDestino: 'Área Académica',
        categoria: 'Servicios Académicos',
        prioridad: 'Alta',
        estado: 'Pendiente'
      },
      {
        id: 'SNC-0002',
        fecha: '08/05/2025',
        areaDestino: 'Infraestructura',
        categoria: 'Infraestructura',
        prioridad: 'Media',
        estado: 'En Proceso'
      },
      {
        id: 'SNC-0003',
        fecha: '05/05/2025',
        areaDestino: 'Bienestar Universitario',
        categoria: 'Atención al Usuario',
        prioridad: 'Baja',
        estado: 'Resuelto'
      },
      {
        id: 'SNC-0004',
        fecha: '01/05/2025',
        areaDestino: 'Área Administrativa',
        categoria: 'Trámites Documentarios',
        prioridad: 'Alta',
        estado: 'Transferido'
      },
      {
        id: 'SNC-0005',
        fecha: '28/04/2025',
        areaDestino: 'Área de Investigación',
        categoria: 'Otros',
        prioridad: 'Media',
        estado: 'Resuelto'
      },
      {
        id: 'SNC-0006',
        fecha: '08/05/2025',
        areaDestino: 'Área de Investigación',
        categoria: 'Otros',
        prioridad: 'Media',
        estado: 'Resuelto'
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

  verDetalles(ticket: Ticket): void {
    console.log('Ver detalles del ticket:', ticket);
  }
}