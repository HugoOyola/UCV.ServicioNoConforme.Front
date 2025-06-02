// ver-ticket.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

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

@Component({
  selector: 'app-ver-ticket',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TagModule, DateFormatPipe],
  templateUrl: './ver-ticket.component.html',
  styleUrl: './ver-ticket.component.scss'
})
export class VerTicketComponent {
  @Input() public visible: boolean = false;
  @Input() public ticket: Ticket | null = null;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();

  close(): void {
    this.btnCerrar.emit();
  }
}