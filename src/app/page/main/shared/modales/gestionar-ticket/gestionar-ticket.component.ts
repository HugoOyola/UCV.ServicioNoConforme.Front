import { Component, EventEmitter, Input, Output, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MainSharedService } from '@shared/services/main-shared.service';
import { MainService } from '../../../services/main.service';

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

// Interfaz para las unidades académicas exactamente como vienen de la API
interface UnidadAcademica {
  nUniOrgCodigo: number;
  cUniOrgNombre: string;
  cPerJuridica: string;
  cPerApellido: string;
  nTipCur: number;
  nPrdCodigo: number;
  idFacultad: number;
}

// Interfaz para las opciones del select
interface AreaOption {
  name: string;
  value: number;
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

  private _mainService = inject(MainService);
  private _mainSharedService = inject(MainSharedService);

  // Estados de carga
  public loading: boolean = false;
  public loadingAreas: boolean = false;

  // Propiedades para el formulario
  public selectedAction: string = '';
  public selectedArea: number | null = null;
  public comentario: string = '';

  public acciones: Accion[] = [
    { nombre: 'Atender', value: 'atender' },
    { nombre: 'Derivar', value: 'derivar' }
  ];

  // Lista de áreas para el select (se carga dinámicamente)
  public areas: AreaOption[] = [];

  constructor() {
    // Usar effect como en el componente de registro
    effect(() => {
      const datosUsuario = this._mainSharedService.datosUsuario();

      if (datosUsuario?.cPerJuridica) {
        console.log('Datos de usuario disponibles en gestionar ticket:', datosUsuario);
      }
    });
  }

  close(): void {
    this.resetForm();
    this.btnCerrar.emit();
  }

  onActionChange(): void {
    // Limpiar el área seleccionada y comentario cuando cambia la acción
    this.selectedArea = null;
    this.comentario = '';

    // Si se selecciona "derivar" y no hay áreas cargadas, cargarlas
    if (this.selectedAction === 'derivar' && this.areas.length === 0) {
      this.cargarUnidadesAcademicas();
    }
  }

  cargarUnidadesAcademicas(): void {
    // Usar la misma lógica que en el componente de registro
    const datosPersonales = this._mainSharedService.datosPersonales();

    if (datosPersonales && datosPersonales.cperjuridica) {
      this.obtenerListadoEscuelas(datosPersonales.cperjuridica);
    } else {
      // Si no tenemos datosPersonales, obtenemos el detalle del personal
      const cPerCodigo = this._mainSharedService.cPerCodigo();

      if (cPerCodigo && cPerCodigo !== '') {
        this._mainService.post_ObtenerServicioDetallePersonal(cPerCodigo).subscribe({
          next: (v) => {
            if (v.body?.lstItem && v.body.lstItem.length > 0) {
              const cPerJuridica = v.body.lstItem[0].cPerJuridica;
              if (cPerJuridica) {
                this.obtenerListadoEscuelas(cPerJuridica);
              } else {
                console.warn('No se encontró cPerJuridica en los datos del personal');
              }
            } else {
              console.warn('No se encontraron datos del personal');
            }
          },
          error: (e) => {
            console.error('Error al obtener los datos del personal:', e);
            this.loadingAreas = false;
          }
        });
      }
    }
  }

  obtenerListadoEscuelas(cPerJuridica: string): void {
    this.loadingAreas = true;

    // Usar nTipoUnidad = 2 como en tu implementación original para derivaciones
    const nTipoUnidad = 2;

    this._mainService.post_ObtenerServicioListadoEscuelas(cPerJuridica, nTipoUnidad).subscribe({
      next: (response) => {
        this.loadingAreas = false;

        if (response.body?.lstItem && response.body.lstItem.length > 0) {
          const unidadesAcademicas: UnidadAcademica[] = response.body.lstItem;

          // Mapeo específico según los datos exactos que vienen de la API
          this.areas = unidadesAcademicas.map(item => ({
            name: item.cUniOrgNombre, // Nombre de la unidad académica
            value: item.nUniOrgCodigo // Código numérico de la unidad
          }));

          // Ordenar alfabéticamente las áreas
          this.areas.sort((a, b) => a.name.localeCompare(b.name));

          console.log('Unidades académicas cargadas para derivación:', this.areas.length);
        } else {
          console.warn('No se encontraron unidades académicas en la respuesta');
          this.areas = [];
        }
      },
      error: (e) => {
        this.loadingAreas = false;
        console.error('Error al obtener el listado de escuelas:', e);
        this.areas = [];
      }
    });
  }

  canProcess(): boolean {
    if (!this.selectedAction) {
      return false;
    }

    if (this.selectedAction === 'derivar') {
      return this.selectedArea !== null && this.selectedArea !== undefined && this.comentario.trim() !== '';
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
      // Obtener el nombre del área seleccionada
      const areaSeleccionada = this.areas.find(area => area.value === this.selectedArea);
      const nombreAreaDestino = areaSeleccionada?.name || '';

      const gestionData = {
        ticketId: this.ticket.id,
        action: this.selectedAction,
        areaDestinoCodigo: this.selectedArea, // Código numérico de la unidad
        areaDestinoNombre: nombreAreaDestino, // Nombre de la unidad
        comentario: this.comentario
      };

      console.log('Gestionar ticket:', gestionData);

      // Aquí implementarías la lógica específica de gestión
      // Por ejemplo, enviar datos al backend usando tu MainService

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
    this.selectedArea = null;
    this.comentario = '';
    this.areas = []; // Limpiar las áreas cargadas
  }
}