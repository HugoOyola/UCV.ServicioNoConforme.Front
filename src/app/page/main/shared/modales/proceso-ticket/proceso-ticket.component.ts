import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';

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

interface ProcesoItem {
  paso: number;
  fecha: string;
  hora: string;
  titulo: string;
  descripcion: string;
  usuario: string;
  estado: 'Registro' | 'Asignación' | 'En Proceso' | 'Resolución';
}

@Component({
  selector: 'app-proceso-ticket',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './proceso-ticket.component.html',
  styleUrl: './proceso-ticket.component.scss'
})
export class ProcesoTicketComponent {
  @Input() public visible: boolean = false;
  @Input() public ticket: Ticket | null = null;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();

  // Datos del seguimiento del proceso basados en la imagen
  public procesoHistorial: ProcesoItem[] = [
    {
      paso: 1,
      fecha: '10/05/2025',
      hora: '10:30',
      titulo: 'Registro',
      descripcion: 'Se registró el servicio no conforme por problemas en el sistema de matrícula.',
      usuario: 'Juan Pérez',
      estado: 'Registro'
    },
    {
      paso: 2,
      fecha: '10/05/2025',
      hora: '14:15',
      titulo: 'Asignación',
      descripcion: 'Asignado a Dirección Académica para revisión técnica.',
      usuario: 'María López',
      estado: 'Asignación'
    },
    {
      paso: 3,
      fecha: '10/05/2025',
      hora: '16:30',
      titulo: 'En Proceso',
      descripcion: 'Se inició la revisión del sistema. Identificado problema en la base de datos.',
      usuario: 'Carlos Rodríguez',
      estado: 'En Proceso'
    },
    {
      paso: 4,
      fecha: '11/05/2025',
      hora: '09:00',
      titulo: 'Resolución',
      descripcion: 'Se solucionó el problema con el sistema de matrícula. Se reinició el servicio y se actualizó la base de datos. Sistema funcionando correctamente.',
      usuario: 'Carlos Rodríguez',
      estado: 'Resolución'
    }
  ];

  close(): void {
    this.btnCerrar.emit();
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'text-yellow-600 bg-yellow-100';
      case 'En Revisión':
        return 'text-blue-600 bg-blue-100';
      case 'Cerrado':
        return 'text-green-600 bg-green-100';
      case 'Derivado':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getStepBackgroundColor(paso: number): string {
    switch (paso) {
      case 1:
        return 'bg-blue-500'; // Registro
      case 2:
        return 'bg-purple-500'; // Asignación
      case 3:
        return 'bg-orange-500'; // En Proceso
      case 4:
        return 'bg-green-500'; // Resolución
      default:
        return 'bg-gray-500';
    }
  }
}