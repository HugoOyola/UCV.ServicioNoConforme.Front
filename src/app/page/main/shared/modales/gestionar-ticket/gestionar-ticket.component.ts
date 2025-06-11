import { Component, EventEmitter, Input, Output, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MainSharedService } from '@shared/services/main-shared.service';
import { MainService } from '../../../services/main.service';

// ==================== INTERFACES ====================
interface Ticket {
  idNoConformidad: number;
  idCodigoNC: string;
  idCategoria: number;
  descripcion: string;
  fechaIncidente: string;
  descripcionNC: string;
  idPrioridad: number;
  cPrioridad: string;
  detalleServicioNC: string;
  cUsOrigen: string;
  cAreaOrigen: string;
  cPuestoOrigen: string;
  unidadDestino: number;
  cAreaDestino: string;
  cPerJuridica: string;
  cFilDestino: string;
  estadoNC: number;
  cEstado: string;
  fechaRegistro: string;
  cPerCodigoDeriva: string;
  correoDeriva: string;
  cUsDestino: string;
  cUnidadDestino: string;
  cCargoDestino: string;
  // Campos adicionales del listado
  cCodigoServ?: string;
  nUniOrgCodigo?: number;
  cUniOrgNombre?: string;
  descripcionCat?: string;
  cPerCodigo?: string;
  cNombreUsuario?: string;
  cDepartamento?: string;
  usuarioCorreo?: string;
  cFilial?: string;
  cPerCodigoSuper?: string;
  cNombreSupervisor?: string;
  cCargoSupervisor?: string;
  correoSupervisor?: string;
  nTipCur?: number;
  tipoNC?: number;
  nPrdCodigo?: number;
  detalleNC?: string | null;
  respuestaNC?: string | null;
  dFechaFinal?: string;
}

interface Accion {
  nombre: string;
  value: string;
}

interface UnidadAcademica {
  nUniOrgCodigo: number;
  cUniOrgNombre: string;
  cPerJuridica: string;
  cPerApellido: string;
  nTipCur: number;
  nPrdCodigo: number;
  idFacultad: number;
}

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
  // ==================== INPUTS Y OUTPUTS ====================
  @Input() public visible: boolean = false;
  @Input() public ticket: Ticket | null = null;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();
  @Output() public ticketDerivado: EventEmitter<Ticket> = new EventEmitter<Ticket>();
  @Output() public ticketAtendido: EventEmitter<Ticket> = new EventEmitter<Ticket>();

  // ==================== SERVICIOS ====================
  private _mainService = inject(MainService);
  private _mainSharedService = inject(MainSharedService);

  // ==================== PROPIEDADES PÚBLICAS ====================
  // Estados de carga
  public loading: boolean = false;
  public loadingAreas: boolean = false;

  // Propiedades para el formulario
  public selectedAction: string = '';
  public selectedArea: number | null = null;
  public comentario: string = '';

  // Opciones para los selects
  public acciones: Accion[] = [
    { nombre: 'Atender', value: 'atender' },
    { nombre: 'Derivar', value: 'derivar' }
  ];

  // Lista de áreas para el select (se carga dinámicamente)
  public areas: AreaOption[] = [];

  // ==================== CONSTRUCTOR ====================
  constructor() {
    // Monitorear cambios en los datos del usuario
    effect(() => {
      const datosUsuario = this._mainSharedService.datosUsuario();
      if (datosUsuario?.cPerJuridica) {
        console.log('Datos de usuario disponibles en gestionar ticket:', datosUsuario);
      }
    });
  }

  // ==================== MÉTODOS DE MODAL ====================

  /**
   * Cierra el modal y resetea el formulario
   */
  close(): void {
    this.resetForm();
    this.btnCerrar.emit();
  }

  /**
   * Maneja el cambio de acción seleccionada
   */
  onActionChange(): void {
    // Limpiar el área seleccionada y comentario cuando cambia la acción
    this.selectedArea = null;
    this.comentario = '';

    // Si se selecciona "derivar" y no hay áreas cargadas, cargarlas
    if (this.selectedAction === 'derivar' && this.areas.length === 0) {
      this.cargarUnidadesAcademicas();
    }
  }

  // ==================== MÉTODOS DE CARGA DE DATOS ====================

  /**
   * Carga las unidades académicas disponibles para derivación
   */
  cargarUnidadesAcademicas(): void {
    const datosPersonales = this._mainSharedService.datosPersonales();

    if (datosPersonales && datosPersonales.cperjuridica) {
      this.obtenerListadoEscuelas(datosPersonales.cperjuridica);
    } else {
      // Si no tenemos datosPersonales, obtenemos el detalle del personal
      const cPerCodigo = this._mainSharedService.cPerCodigo();
      const correoCorpo = this._mainSharedService.datosUsuario()?.cMailCorp;
      console.log('Correo corporativo del usuario:', correoCorpo);

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

  /**
   * Obtiene el listado de escuelas/unidades académicas
   */
  obtenerListadoEscuelas(cPerJuridica: string): void {
    this.loadingAreas = true;
    // Usar nTipoUnidad = 2 para derivaciones
    const nTipoUnidad = 2;

    this._mainService.post_ObtenerServicioListadoEscuelas(cPerJuridica, nTipoUnidad).subscribe({
      next: (response) => {
        this.loadingAreas = false;

        if (response.body?.lstItem && response.body.lstItem.length > 0) {
          const unidadesAcademicas: UnidadAcademica[] = response.body.lstItem;

          // Mapear las unidades académicas a opciones para el select
          this.areas = unidadesAcademicas.map(item => ({
            name: item.cUniOrgNombre,
            value: item.nUniOrgCodigo
          }));

          // Ordenar alfabéticamente las áreas
          this.areas.sort((a, b) => a.name.localeCompare(b.name));
          console.log('✅ Unidades académicas cargadas para derivación:', this.areas.length);
        } else {
          console.warn('No se encontraron unidades académicas en la respuesta');
          this.areas = [];
        }
      },
      error: (e) => {
        this.loadingAreas = false;
        console.error('❌ Error al obtener el listado de escuelas:', e);
        this.areas = [];
      }
    });
  }

  // ==================== MÉTODOS DE VALIDACIÓN ====================

  /**
   * Verifica si se puede procesar la acción
   */
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

  // ==================== MÉTODOS PARA UI DINÁMICA ====================

  /**
   * Obtiene las clases CSS para el botón de procesar
   */
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

  /**
   * Obtiene el texto del botón de procesar
   */
  getProcessButtonLabel(): string {
    if (this.selectedAction === 'derivar') {
      return 'Derivar';
    }
    return 'Procesar';
  }

  /**
   * Obtiene el icono del botón de procesar
   */
  getProcessButtonIcon(): string {
    if (this.selectedAction === 'derivar') {
      return 'pi pi-share-alt';
    }
    return 'pi pi-check';
  }

  /**
   * Obtiene la severidad del botón de procesar para PrimeNG
   */
  getProcessButtonSeverity(): 'success' | 'info' | 'secondary' {
    if (!this.canProcess()) {
      return 'secondary';
    }

    if (this.selectedAction === 'derivar') {
      return 'info';
    }

    return 'success';
  }

  // ==================== MÉTODOS DE GESTIÓN PRINCIPAL ====================

  /**
   * Método principal para gestionar el ticket
   */
  gestionar(): void {
    if (this.canProcess() && this.ticket) {
      this.loading = true;

      if (this.selectedAction === 'derivar') {
        this.derivarTicket();
      } else if (this.selectedAction === 'atender') {
        this.atenderTicket();
      }
    }
  }

  /**
   * Deriva el ticket a otra área
   */
  private derivarTicket(): void {
    if (!this.ticket || !this.selectedArea) {
      console.error('❌ Faltan datos para derivar el ticket');
      this.loading = false;
      return;
    }

    const cPerCodigo = this._mainSharedService.cPerCodigo();
    if (!cPerCodigo) {
      console.error('❌ No se ha identificado el usuario');
      this.loading = false;
      return;
    }

    // Obtener datos del usuario actual desde el servicio compartido
    const datosUsuario = this._mainSharedService.datosUsuario();

    if (!datosUsuario) {
      console.error('❌ No se han cargado los datos del usuario');
      this.loading = false;
      return;
    }

    // Debug: Mostrar todos los datos disponibles
    console.log('=== DEBUG DERIVACIÓN ===');
    console.log('📋 Ticket completo:', this.ticket);
    console.log('👤 Datos usuario actual:', datosUsuario);
    console.log('📂 ID Categoría:', this.ticket.idCategoria);
    console.log('📍 Lugar incidente (descripcionNC):', this.ticket.descripcionNC);
    console.log('📝 Detalle servicio:', this.ticket.detalleServicioNC);
    console.log('🎯 Área destino seleccionada:', this.selectedArea);
    console.log('💬 Comentario:', this.comentario);
    console.log('=== FIN DEBUG ===');

    // Si necesitamos obtener el nombre de la categoría, lo hacemos primero
    if (this.ticket.idCategoria && (!this.ticket.descripcionCat && !this.ticket.descripcion)) {
      console.log('🔍 Obteniendo nombre de categoría para ID:', this.ticket.idCategoria);
      this.obtenerNombreCategoria(this.ticket.idCategoria, datosUsuario);
    } else {
      // Si ya tenemos el nombre de la categoría, proceder directamente
      this.procesarDerivacion(datosUsuario);
    }
  }

  /**
   * Obtiene el nombre de la categoría y luego procesa la derivación
   */
  private obtenerNombreCategoria(idCategoria: number, datosUsuario: any): void {
    // Usar los mismos parámetros que en el componente de registro
    const nIntCodigo = 0;
    const nIntClase = 1001;  // ← Este es el parámetro correcto del registro
    const nIntTipo = 0;
    const cIntJerarquia = '';

    console.log('🔍 Buscando categoría con ID:', idCategoria, 'usando parámetros:', { nIntCodigo, nIntClase, nIntTipo, cIntJerarquia });

    this._mainService.post_ObtenerServicioListadoCategoria(nIntCodigo, nIntClase, nIntTipo, cIntJerarquia).subscribe({
      next: (response) => {
        console.log('📋 Respuesta de categorías:', response.body);

        if (response.body?.lstItem && response.body.lstItem.length > 0) {
          // Buscar la categoría por el campo 'codigo' (no 'idCategoria')
          const categoria = response.body.lstItem.find((cat: any) => cat.codigo === idCategoria);

          console.log('🎯 Categoría encontrada:', categoria);

          if (categoria && this.ticket) {
            // Usar el campo 'descripcion' que es el que contiene el nombre
            this.ticket.descripcionCat = categoria.descripcion || '';
            console.log('✅ Nombre de categoría obtenido:', this.ticket.descripcionCat);
          } else {
            console.warn('⚠️ No se encontró categoría con código:', idCategoria);
          }
        } else {
          console.warn('⚠️ No se encontraron categorías en la respuesta');
        }

        // Proceder con la derivación
        this.procesarDerivacion(datosUsuario);
      },
      error: (error) => {
        console.warn('⚠️ No se pudo obtener el nombre de la categoría:', error);
        // Proceder con la derivación sin el nombre de categoría
        this.procesarDerivacion(datosUsuario);
      }
    });
  }

  /**
   * Procesa la derivación con todos los datos completos
   */
  private procesarDerivacion(datosUsuario: any): void {
    if (!this.ticket || !this.selectedArea) {
      console.error('❌ Faltan datos para procesar la derivación');
      this.loading = false;
      return;
    }

    const cPerCodigo = this._mainSharedService.cPerCodigo();

    // Preparar datos para la derivación usando la estructura correcta de la API
    const datosDerivacion = {
      cPerCodigo: cPerCodigo!,
      idNoConformidad: this.ticket.idNoConformidad,
      idCodigoNC: this.ticket.idCodigoNC,

      // Datos del usuario ORIGEN (quien reportó) - usar datos del ticket si están disponibles, sino del usuario actual
      cNombreUsuarioO: this.ticket.cNombreUsuario || datosUsuario.cColaborador || '',
      cAreaUsuarioO: this.ticket.cDepartamento || this.ticket.cAreaOrigen || datosUsuario.cArea || '',
      cPuestoUsuarioO: this.ticket.cPuestoOrigen || datosUsuario.cPuesto || datosUsuario.cCargo || '',
      nUniOrgCodigoO: this.ticket.nUniOrgCodigo || datosUsuario.nUniOrgCodigo || 0,

      // Datos del incidente
      cNombreCategoria: this.ticket.descripcionCat || this.ticket.descripcion || 'Sin categoría',
      dfechaIncidente: this.ticket.fechaIncidente || this.ticket.fechaRegistro || '',
      fechaRegistroNC: this.ticket.fechaRegistro || '',

      // CAMPO CLAVE: descripcionNC es donde está el lugar del incidente
      cLugarIncidente: this.ticket.descripcionNC ||
                      this.ticket.detalleNC ||
                      this.ticket.detalleServicioNC ||
                      'No especificado',

      cNombrePrioridad: this.ticket.cPrioridad || '',
      cDetalleServicio: this.ticket.detalleServicioNC || '',

      // Datos institucionales - usar del ticket primero, luego del usuario actual
      cPerJuridica: this.ticket.cPerJuridica || datosUsuario.cPerJuridica || '',
      cFilialUsuarioO: this.ticket.cFilial || this.ticket.cFilDestino || datosUsuario.cPerApellido || '',
      cUsuarioCorreoO: this.ticket.usuarioCorreo || this.ticket.correoDeriva || datosUsuario.cMailCorp || '',

      // Área DESTINO (a donde se deriva)
      nUniOrgCodigoD: this.selectedArea,
      comentario: this.comentario.trim()
    };

    console.log('📤 Datos finales para derivación:', datosDerivacion);
    console.log('📂 cNombreCategoria enviado:', datosDerivacion.cNombreCategoria);
    console.log('🏢 nUniOrgCodigoO enviado:', datosDerivacion.nUniOrgCodigoO);
    console.log('📍 cLugarIncidente enviado:', datosDerivacion.cLugarIncidente);
    console.log('👤 Datos de usuario origen completados:', {
      nombre: datosDerivacion.cNombreUsuarioO,
      area: datosDerivacion.cAreaUsuarioO,
      puesto: datosDerivacion.cPuestoUsuarioO,
      correo: datosDerivacion.cUsuarioCorreoO,
      filial: datosDerivacion.cFilialUsuarioO
    });

    // Llamar al servicio de derivación
    this._mainService.post_DerivarServicioNC(datosDerivacion).subscribe({
      next: (response) => {
        console.log('📨 Respuesta de derivación:', response);

        if (response.status === 200) {
          console.log('✅ Ticket derivado exitosamente');

          // Crear ticket actualizado con el nuevo estado
          const ticketActualizado = {
            ...this.ticket!,
            estadoNC: 4,
            cEstado: 'Derivado',
            cAreaDestino: this.areas.find(area => area.value === this.selectedArea)?.name || this.ticket!.cAreaDestino,
            unidadDestino: this.selectedArea!,
            // Actualizar campos de derivación
            cPerCodigoDeriva: cPerCodigo!,
            correoDeriva: datosUsuario.cMailCorp || '',
            cUsDestino: datosUsuario.cColaborador || '',
            cUnidadDestino: this.areas.find(area => area.value === this.selectedArea)?.name || ''
          };

          this.ticketDerivado.emit(ticketActualizado);
          this.close();
        } else {
          console.error('❌ Error en la derivación:', response.body);
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al derivar ticket:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Atiende el ticket directamente
   */
  private atenderTicket(): void {
    console.log('✅ Atendiendo ticket:', this.ticket);
    console.log('💬 Comentario:', this.comentario);

    // Aquí puedes implementar la lógica específica para atender el ticket
    // Por ejemplo, llamar a un endpoint específico para cerrar el ticket

    // Simular proceso de atención (reemplazar con llamada real al API)
    setTimeout(() => {
      if (this.ticket) {
        const ticketActualizado = {
          ...this.ticket,
          estadoNC: 3, // Estado "Cerrado" o similar
          cEstado: 'Cerrado'
        };

        this.ticketAtendido.emit(ticketActualizado);
      }

      this.loading = false;
      this.close();
    }, 1000);
  }

  // ==================== MÉTODOS UTILITARIOS ====================

  /**
   * Resetea el formulario a su estado inicial
   */
  private resetForm(): void {
    this.selectedAction = '';
    this.selectedArea = null;
    this.comentario = '';
    this.areas = []; // Limpiar las áreas cargadas
    this.loading = false;
    this.loadingAreas = false;
  }

  /**
   * Obtiene información organizada del ticket para mostrar en UI
   */
  getTicketInfo(): any {
    if (!this.ticket) return {};

    return {
      codigo: this.ticket.cCodigoServ || `SNC-${this.ticket.idCodigoNC}`,
      fechaRegistro: this.ticket.fechaRegistro,
      areaActual: this.ticket.cAreaDestino || this.ticket.cUniOrgNombre,
      prioridad: this.ticket.cPrioridad,
      categoria: this.ticket.descripcionCat || this.ticket.descripcion,
      usuarioReportador: this.ticket.cNombreUsuario,
      departamentoOrigen: this.ticket.cDepartamento,
      correoUsuario: this.ticket.usuarioCorreo,
      detalleServicio: this.ticket.detalleServicioNC,
      lugarIncidente: this.ticket.descripcionNC, // Aquí está "oficina de psicología"
      supervisor: this.ticket.cNombreSupervisor,
      correoSupervisor: this.ticket.correoSupervisor,
      filial: this.ticket.cFilial,
      unidadOrganizacional: this.ticket.cUniOrgNombre
    };
  }

  /**
   * Método para debug y verificación de datos (usar solo en desarrollo)
   */
  debugTicketData(): void {
    console.log('=== 🐛 INFORMACIÓN COMPLETA DEL TICKET ===');
    if (this.ticket) {
      console.log('📋 Código completo:', this.ticket.cCodigoServ);
      console.log('🆔 ID Código NC:', this.ticket.idCodigoNC);
      console.log('👤 Usuario que reportó:', this.ticket.cNombreUsuario);
      console.log('🏢 Departamento origen:', this.ticket.cDepartamento);
      console.log('📧 Email usuario:', this.ticket.usuarioCorreo);
      console.log('📍 Lugar del incidente:', this.ticket.descripcionNC);
      console.log('📝 Detalle del servicio:', this.ticket.detalleServicioNC);
      console.log('🎯 Área actual:', this.ticket.cAreaDestino);
      console.log('👨‍💼 Supervisor:', this.ticket.cNombreSupervisor);
      console.log('📧 Email supervisor:', this.ticket.correoSupervisor);
      console.log('🏛️ Unidad organizacional:', this.ticket.cUniOrgNombre);
      console.log('🏢 Filial:', this.ticket.cFilial);
      console.log('⚖️ Persona jurídica:', this.ticket.cPerJuridica);
      console.log('📊 Prioridad:', this.ticket.cPrioridad);
      console.log('📂 Categoría:', this.ticket.descripcionCat);
      console.log('📅 Fecha registro:', this.ticket.fechaRegistro);
      console.log('📅 Fecha incidente:', this.ticket.fechaIncidente);
      console.log('🔢 Estado NC:', this.ticket.estadoNC);
      console.log('📋 Estado texto:', this.ticket.cEstado);
      console.log('=== 🐛 FIN DEBUG ===');
    } else {
      console.log('❌ No hay ticket disponible para debug');
    }
  }
}