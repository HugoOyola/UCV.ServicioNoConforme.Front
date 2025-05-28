import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  fecha: string;
  hora: string;
  accion: string;
  usuario: string;
  comentario?: string;
  estado: 'Pendiente' | 'En Revisión' | 'Cerrado' | 'Derivado';
}

@Component({
  selector: 'app-proceso-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proceso-ticket.component.html',
  styleUrl: './proceso-ticket.component.scss'
})
export class ProcesoTicketComponent {
  @Input() public visible: boolean = false;
  @Input() public ticket: Ticket | null = null;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();

  // Datos de ejemplo del proceso (en un caso real vendrían de un servicio)
  public procesoHistorial: ProcesoItem[] = [
    {
      fecha: '10/05/2025',
      hora: '08:30',
      accion: 'Creación del ticket',
      usuario: 'Sistema',
      comentario: 'Ticket creado automáticamente desde el formulario web',
      estado: 'Pendiente'
    },
    {
      fecha: '10/05/2025',
      hora: '09:15',
      accion: 'Asignación',
      usuario: 'Ana García (Coordinadora)',
      comentario: 'Asignado al área de Servicios Académicos para revisión',
      estado: 'En Revisión'
    },
    {
      fecha: '10/05/2025',
      hora: '14:20',
      accion: 'En proceso',
      usuario: 'Carlos López (Técnico)',
      comentario: 'Iniciando revisión del sistema de matrícula. Se detectaron problemas en el servidor',
      estado: 'En Revisión'
    },
    {
      fecha: '11/05/2025',
      hora: '10:30',
      accion: 'Actualización',
      usuario: 'Carlos López (Técnico)',
      comentario: 'Servidor reparado. Realizando pruebas de funcionalidad',
      estado: 'En Revisión'
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

  getIconoAccion(accion: string): string {
    switch (accion.toLowerCase()) {
      case 'creación del ticket':
        return 'pi pi-plus-circle';
      case 'asignación':
        return 'pi pi-user';
      case 'en proceso':
        return 'pi pi-cog';
      case 'actualización':
        return 'pi pi-refresh';
      case 'derivación':
        return 'pi pi-send';
      case 'cierre':
        return 'pi pi-check-circle';
      default:
        return 'pi pi-circle';
    }
  }

  getColorIcono(accion: string): string {
    switch (accion.toLowerCase()) {
      case 'creación del ticket':
        return 'text-blue-500';
      case 'asignación':
        return 'text-orange-500';
      case 'en proceso':
        return 'text-yellow-500';
      case 'actualización':
        return 'text-blue-500';
      case 'derivación':
        return 'text-purple-500';
      case 'cierre':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }
}
