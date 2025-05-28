import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

interface Ticket {
  id: string;
  fecha: string;
  areaDestino: string;
  categoria: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'En Revisión' | 'Cerrado' | 'Derivado' | 'Atendido';
  detalle: string;
  lugar: string;
  fechaRegistro: string;
}

interface ActividadSeguimiento {
  id: string;
  tipo: 'creacion' | 'asignacion' | 'derivacion' | 'atencion' | 'cierre' | 'comentario';
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  area?: string;
  usuario?: string;
  comentario?: string;
  duracion?: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
}

@Component({
  selector: 'app-seguimiento-ticket',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './seguimiento-ticket.component.html',
  styleUrl: './seguimiento-ticket.component.scss'
})
export class SeguimientoTicketComponent implements OnInit {
  @Input() public visible: boolean = false;
  @Input() public ticket: Ticket | null = null;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();

  public loading: boolean = false;
  public actividades: ActividadSeguimiento[] = [];

  ngOnInit(): void {
    this.cargarActividades();
  }

  close(): void {
    this.btnCerrar.emit();
  }

  private cargarActividades(): void {
    // Simular datos de actividades del ticket
    // En una aplicación real, estos datos vendrían de un servicio
    this.actividades = [
      {
        id: '1',
        tipo: 'creacion',
        titulo: 'Caso Creado',
        descripcion: 'El caso fue registrado en el sistema por el usuario solicitante.',
        fecha: '20/05/2025',
        hora: '09:15',
        area: 'Mesa de Ayuda',
        usuario: 'Juan Pérez',
        comentario: 'Problema reportado por estudiante con matrícula en línea',
        duracion: '-'
      },
      {
        id: '2',
        tipo: 'asignacion',
        titulo: 'Caso Asignado',
        descripcion: 'El caso fue asignado al área de Servicios Académicos para su revisión inicial.',
        fecha: '20/05/2025',
        hora: '10:30',
        area: 'Servicios Académicos',
        usuario: 'María González',
        estadoAnterior: 'Pendiente',
        estadoNuevo: 'En Revisión'
      },
      {
        id: '3',
        tipo: 'derivacion',
        titulo: 'Caso Derivado',
        descripcion: 'El caso fue derivado al área de Sistemas debido a que requiere soporte técnico especializado.',
        fecha: '20/05/2025',
        hora: '14:45',
        area: 'Sistemas',
        usuario: 'Carlos Rodríguez',
        comentario: 'Se requiere revisión del servidor de matrículas y base de datos',
        estadoAnterior: 'En Revisión',
        estadoNuevo: 'Derivado'
      },
      {
        id: '4',
        tipo: 'atencion',
        titulo: 'Caso en Atención',
        descripcion: 'El área de Sistemas comenzó la atención del caso, identificando problemas en el servidor.',
        fecha: '21/05/2025',
        hora: '08:00',
        area: 'Sistemas',
        usuario: 'Ana Martínez',
        comentario: 'Identificado problema en conexión a base de datos, procediendo con reparación',
        duracion: '2 horas'
      },
      {
        id: '5',
        tipo: 'comentario',
        titulo: 'Actualización de Progreso',
        descripcion: 'Se proporcionó una actualización sobre el progreso de la solución.',
        fecha: '21/05/2025',
        hora: '11:30',
        area: 'Sistemas',
        usuario: 'Ana Martínez',
        comentario: 'Servidor reparado, realizando pruebas de funcionalidad del sistema de matrículas'
      },
      {
        id: '6',
        tipo: 'atencion',
        titulo: 'Caso Resuelto',
        descripcion: 'El problema fue resuelto exitosamente y el sistema de matrículas está funcionando correctamente.',
        fecha: '21/05/2025',
        hora: '15:20',
        area: 'Sistemas',
        usuario: 'Ana Martínez',
        comentario: 'Sistema restaurado completamente. Estudiantes pueden proceder con matrículas.',
        duracion: '6 horas',
        estadoAnterior: 'Derivado',
        estadoNuevo: 'Atendido'
      }
    ];
  }

  getEstadoBadgeClass(estado: string | undefined): string {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'En Revisión':
        return 'bg-blue-100 text-blue-800';
      case 'Derivado':
        return 'bg-purple-100 text-purple-800';
      case 'Atendido':
        return 'bg-green-100 text-green-800';
      case 'Cerrado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getActividadIconClass(tipo: string): string {
    switch (tipo) {
      case 'creacion':
        return 'bg-green-400';
      case 'asignacion':
        return 'bg-blue-400';
      case 'derivacion':
        return 'bg-purple-400';
      case 'atencion':
        return 'bg-orange-400';
      case 'cierre':
        return 'bg-gray-400';
      case 'comentario':
        return 'bg-indigo-400';
      default:
        return 'bg-gray-400';
    }
  }

  getActividadIcon(tipo: string): string {
    switch (tipo) {
      case 'creacion':
        return 'pi pi-plus-circle';
      case 'asignacion':
        return 'pi pi-user-plus';
      case 'derivacion':
        return 'pi pi-send';
      case 'atencion':
        return 'pi pi-cog';
      case 'cierre':
        return 'pi pi-check-circle';
      case 'comentario':
        return 'pi pi-comment';
      default:
        return 'pi pi-circle';
    }
  }

  getEstadisticas(): { totalActividades: number; areasInvolucradas: number; tiempoTotal: string } {
    const totalActividades = this.actividades.length;
    const areasUnicas = new Set(this.actividades.map(a => a.area).filter(Boolean));
    const areasInvolucradas = areasUnicas.size;

    // Calcular tiempo total basado en las fechas
    const fechaInicio = new Date('2025-05-20');
    const fechaFin = new Date('2025-05-21');
    const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const tiempoTotal = `${diffDays} día${diffDays !== 1 ? 's' : ''}`;

    return {
      totalActividades,
      areasInvolucradas,
      tiempoTotal
    };
  }

  getUltimaActualizacion(): string {
    if (this.actividades.length > 0) {
      const ultimaActividad = this.actividades[this.actividades.length - 1];
      return `${ultimaActividad.fecha} ${ultimaActividad.hora}`;
    }
    return 'No disponible';
  }

  exportarPDF(): void {
    // Implementar lógica para exportar a PDF
    console.log('Exportando seguimiento a PDF...');
    // Aquí podrías usar una librería como jsPDF o llamar a un endpoint del backend
  }
}