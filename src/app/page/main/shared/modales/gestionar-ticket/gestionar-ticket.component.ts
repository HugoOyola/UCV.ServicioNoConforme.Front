import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

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

interface Accion {
  nombre: string;
  value: string;
}

@Component({
  selector: 'app-gestionar-ticket',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule, Select, Textarea, TooltipModule],
  templateUrl: './gestionar-ticket.component.html',
  styleUrl: './gestionar-ticket.component.scss'
})
export class GestionarTicketComponent {
  @Input() public visible: boolean = false;
  @Input() public ticket: Ticket | null = null;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();

  // Estados de carga
  public loading: boolean = false;

  // Propiedades para el formulario
  public selectedAction: string = '';
  public selectedArea: string = '';
  public comentario: string = '';

  public acciones: Accion[] = [
    { nombre: 'Atender', value: 'atender' },
    { nombre: 'Derivar', value: 'derivar' }
  ];

  public areas = [
    { nombre: 'Sistemas', value: 'sistemas' },
    { nombre: 'Académico', value: 'academico' },
    { nombre: 'Administración', value: 'administracion' },
    { nombre: 'Soporte Técnico', value: 'soporte' }
  ];

  close(): void {
    this.resetForm();
    this.btnCerrar.emit();
  }

  onActionChange(): void {
    // Limpiar el área seleccionada y comentario cuando cambia la acción
    this.selectedArea = '';
    this.comentario = '';
  }

  canProcess(): boolean {
    if (!this.selectedAction) {
      return false;
    }

    if (this.selectedAction === 'derivar') {
      return this.selectedArea !== '' && this.comentario.trim() !== '';
    }

    if (this.selectedAction === 'atender') {
      return this.comentario.trim() !== '';
    }

    return false;
  }

  getProcessButtonClass(): string {
    const baseClasses = 'px-4 py-2 rounded-md text-sm transition-colors duration-200';

    if (!this.canProcess()) {
      return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }

    if (this.selectedAction === 'derivar') {
      return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
    }

    return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`;
  }

  // Métodos adicionales para PrimeNG Button
  getProcessButtonLabel(): string {
    if (this.selectedAction === 'derivar') {
      return 'Derivar';
    }
    return 'Procesar';
  }

  getProcessButtonIcon(): string {
    if (this.selectedAction === 'derivar') {
      return 'pi pi-share-alt';
    }
    return 'pi pi-check';
  }

  getProcessButtonSeverity(): 'success' | 'info' | 'secondary' {
    if (!this.canProcess()) {
      return 'secondary';
    }

    if (this.selectedAction === 'derivar') {
      return 'info';
    }

    return 'success';
  }

  gestionar(): void {
    if (this.canProcess() && this.ticket) {
      const gestionData = {
        ticketId: this.ticket.id,
        action: this.selectedAction,
        area: this.selectedArea,
        comentario: this.comentario
      };

      console.log('Gestionar ticket:', gestionData);

      // Aquí implementarías la lógica específica de gestión
      // Por ejemplo, enviar datos al backend

      // Simular proceso de gestión
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.close();
      }, 1000);
    }
  }

  private resetForm(): void {
    this.selectedAction = '';
    this.selectedArea = '';
    this.comentario = '';
  }
}