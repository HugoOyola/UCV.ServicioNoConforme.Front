import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';

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
  selector: 'app-editar-ticket',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    CalendarModule,
    ButtonModule
  ],
  templateUrl: './editar-ticket.component.html',
  styleUrls: ['./editar-ticket.component.scss']
})
export class EditarTicketComponent implements OnChanges {
  @Input() public visible: boolean = false;
  @Input() public ticket: Ticket | null = null;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();
  @Output() public btnGuardar: EventEmitter<Ticket> = new EventEmitter<Ticket>();

  // Copia del ticket para editar sin modificar el original
  public ticketEditado: Ticket | null = null;

  // Opciones para los dropdowns
  public prioridadOptions = [
    { label: 'Alta', value: 'Alta' },
    { label: 'Media', value: 'Media' },
    { label: 'Baja', value: 'Baja' }
  ];

  public estadoOptions = [
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'En Revisión', value: 'En Revisión' },
    { label: 'Cerrado', value: 'Cerrado' },
    { label: 'Derivado', value: 'Derivado' }
  ];

  public categoriasOptions = [
    { label: 'Servicios Académicos', value: 'Servicios Académicos' },
    { label: 'Infraestructura', value: 'Infraestructura' },
    { label: 'Atención al Usuario', value: 'Atención al Usuario' },
    { label: 'Trámites Documentarios', value: 'Trámites Documentarios' },
    { label: 'Otros', value: 'Otros' }
  ];

  public areasOptions = [
    { label: 'Área Académica', value: 'Área Académica' },
    { label: 'Infraestructura', value: 'Infraestructura' },
    { label: 'Bienestar Universitario', value: 'Bienestar Universitario' },
    { label: 'Área Administrativa', value: 'Área Administrativa' },
    { label: 'Área de Investigación', value: 'Área de Investigación' }
  ];

  ngOnChanges(): void {
    // Cuando el ticket de entrada cambia, creamos una copia para editar
    if (this.ticket) {
      this.ticketEditado = {...this.ticket};
    }
  }

  close(): void {
    this.btnCerrar.emit();
  }

  guardar(): void {
    if (this.ticketEditado) {
      this.btnGuardar.emit(this.ticketEditado);
      this.close();
    }
  }
}