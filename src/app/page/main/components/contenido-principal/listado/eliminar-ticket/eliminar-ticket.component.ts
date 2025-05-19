// eliminar-ticket.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

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

@Component({
  selector: 'app-eliminar-ticket',
  standalone: true,
  imports: [ CommonModule, ButtonModule ],
  templateUrl: './eliminar-ticket.component.html',
  styleUrls: ['./eliminar-ticket.component.scss']
})
export class EliminarTicketComponent {
  @Input() public visible: boolean = false;
  @Input() public ticket: Ticket | null = null;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();
  @Output() public btnConfirmar: EventEmitter<Ticket> = new EventEmitter<Ticket>();

  close(): void {
    this.btnCerrar.emit();
  }

  confirmarEliminacion(): void {
    if (this.ticket) {
      this.btnConfirmar.emit(this.ticket);
    }
  }
}