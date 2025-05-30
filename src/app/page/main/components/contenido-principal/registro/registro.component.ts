import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MainSharedService } from '@shared/services/main-shared.service';
import { MainService } from '../../../services/main.service';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

// Interfaz para las categorías tal como vienen de la API
interface Categoria {
  codigo: number;
  categoria: number;
  jerarquia: string | null;
  nombre: string;
  descripcion: string;
  tipo: number;
}

// Interfaz para las opciones del select de categorías
interface CategoriaOption {
  name: string;
  value: number;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectModule, DatePickerModule, RadioButtonModule, InputTextModule, TextareaModule, ButtonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent implements OnInit {
  private _http = inject(HttpClient);
  private _mainService = inject(MainService);
  private _mainSharedService = inject(MainSharedService);

  public maxDate: Date = new Date();
  public form: FormGroup;

  // Lista de unidades académicas
  public unidadesAcademicas: UnidadAcademica[] = [];
  // Lista de áreas para el select
  public areas: AreaOption[] = [];

  public prioridades = [
    { label: 'Alta', value: 1, color: 'bg-red-500' },
    { label: 'Media', value: 2, color: 'bg-yellow-400' },
    { label: 'Baja', value: 3, color: 'bg-green-500' },
  ];

  public ipUsuario = signal<string>('0.0.0.0');

  // En el componente, actualizar la definición de categorias
  public categorias: CategoriaOption[] = [];

  // Agregar propiedad para el nombre del campus
  public campusNombre: string = '';

  constructor(private fb: FormBuilder) {
    this.loadIpAddress();

    this.form = this.fb.group({
      area: ['', Validators.required],
      categoria: ['', Validators.required],
      prioridad: ['', Validators.required],
      fecha: [''],
      lugar: [''],
      detalle: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });

    // Usar effect como en el ejemplo de usuario-info
    effect(() => {
      console.log('Contenido: ', this._mainSharedService.datosUsuario());
      const cPerCodigoSignal = this._mainSharedService.cPerCodigo();
      this.cargarUnidadesAcademicas();
      this.obtenerNombreCampus();
      console.log('Prueba de cPerCodigoSignal:', cPerCodigoSignal);
      console.log('El IP: ',this.getIp());
    });
  }

  ngOnInit(): void {
    // Cargar unidades académicas al iniciar
    if (this._mainSharedService.cPerCodigo() !== '') {
      this.cargarUnidadesAcademicas();
    }
    // Cargar las categorías
    this.cargarCategorias();

    // Obtener el nombre del campus
    this.obtenerNombreCampus();
  }

  // Nuevo método para obtener el nombre del campus
  obtenerNombreCampus(): void {
    // Primero intentar obtener de datosPersonales si está disponible
    const datosPersonales = this._mainSharedService.datosPersonales();

    if (datosPersonales && datosPersonales.cperjuridica) {
      // Si tenemos datosPersonales, obtener el cPerApellido directamente del servicio de detalle
      this._mainService.post_ObtenerServicioDetallePersonal(this._mainSharedService.cPerCodigo()).subscribe({
        next: (response) => {
          if (response.body?.lstItem && response.body.lstItem.length > 0) {
            const cPerApellido = response.body.lstItem[0].cPerApellido;
            this.campusNombre = this.formatearNombreCampus(cPerApellido);
            console.log('Campus obtenido:', this.campusNombre);
          }
        },
        error: (error) => {
          console.error('Error al obtener datos del campus:', error);
          this.campusNombre = '-'; // Fallback
        }
      });
    } else if (this._mainSharedService.cPerCodigo() !== '') {
      // Si no tenemos datosPersonales pero sí cPerCodigo, obtener del servicio
      this._mainService.post_ObtenerServicioDetallePersonal(this._mainSharedService.cPerCodigo()).subscribe({
        next: (response) => {
          if (response.body?.lstItem && response.body.lstItem.length > 0) {
            const cPerApellido = response.body.lstItem[0].cPerApellido;
            this.campusNombre = this.formatearNombreCampus(cPerApellido);
            console.log('Campus obtenido:', this.campusNombre);
          }
        },
        error: (error) => {
          console.error('Error al obtener datos del campus:', error);
          this.campusNombre = '-'; //
        }
      });
    }
  }

  // Método auxiliar para formatear el nombre del campus
  private formatearNombreCampus(apellido: string | undefined): string {
    if (!apellido || apellido.trim() === '') {
      return 'Campus';
    }

    // Capitalizar primera letra y resto en minúsculas
    const formatted = apellido.charAt(0).toUpperCase() + apellido.slice(1).toLowerCase();
    return formatted;
  }

  private async loadIpAddress(): Promise<void> {
    try {
      const response = await lastValueFrom(this._http.get<{ ip: string }>('https://api64.ipify.org?format=json'));
      this.ipUsuario.set(response.ip || '0.0.0.0'); // Guardamos la IP en la variable reactiva
    } catch (error) {
      console.error('Error obteniendo la IP:', error);
      this.ipUsuario.set('0.0.0.0'); // Fallback en caso de error
    }
  }

  getIp(): string {
    return this.ipUsuario(); // Método para obtener la IP en cualquier parte del código
  }

  cargarUnidadesAcademicas(): void {
    // Primero intentamos obtener cPerJuridica de los datos personales
    const datosPersonales = this._mainSharedService.datosPersonales();

    if (datosPersonales && datosPersonales.cperjuridica) {
      this.obtenerListadoEscuelas(datosPersonales.cperjuridica);
    } else {
      // Si no tenemos datosPersonales, obtenemos el detalle del personal
      this._mainService.post_ObtenerServicioDetallePersonal(this._mainSharedService.cPerCodigo()).subscribe({
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
        }
      });
    }
  }

  obtenerListadoEscuelas(cPerJuridica: string): void {
    // Llamada al servicio para obtener las unidades académicas
    const nTipoUnidad = 1
    this._mainService.post_ObtenerServicioListadoEscuelas(cPerJuridica, nTipoUnidad).subscribe({
      next: (response) => {
        if (response.body?.lstItem && response.body.lstItem.length > 0) {
          const unidadesAcademicas: UnidadAcademica[] = response.body.lstItem;

          // Mapeo específico según los datos exactos que vienen de la API
          this.areas = unidadesAcademicas.map(item => ({
            name: item.cUniOrgNombre, // Nombre de la unidad académica
            value: item.nUniOrgCodigo // Código numérico de la unidad
          }));

          // Ordenar alfabéticamente las áreas
          this.areas.sort((a, b) => a.name.localeCompare(b.name));

          console.log('Unidades académicas cargadas:', this.areas.length);
        } else {
          console.warn('No se encontraron unidades académicas en la respuesta');
          this.areas = [];
        }
      },
      error: (e) => {
        console.error('Error al obtener el listado de escuelas:', e);
        this.areas = [];
      }
    });
  }

  // Agregar función para cargar categorías
  cargarCategorias(): void {
    // Parámetros según lo indicado
    const params = {
      nIntCodigo: 0,
      nIntClase: 1001,
      nIntTipo: 0,
      cIntJerarquia: ""
    };

    // Llamar al servicio con los parámetros especificados
    this._mainService.post_ObtenerServicioListadoCategoria(
      params.nIntCodigo,
      params.nIntClase,
      params.nIntTipo,
      params.cIntJerarquia
    ).subscribe({
      next: (response) => {
        if (response.body?.lstItem && response.body.lstItem.length > 0) {
          const categoriasResponse: Categoria[] = response.body.lstItem;

          // Mapear a la estructura necesaria para el select
          this.categorias = categoriasResponse.map(item => ({
            name: item.descripcion,
            value: item.codigo
          }));

          // Ordenar alfabéticamente las categorías
          this.categorias.sort((a, b) => a.name.localeCompare(b.name));

          console.log('Categorías cargadas:', this.categorias.length);
        } else {
          console.warn('No se encontraron categorías en la respuesta');
          this.categorias = [];
        }
      },
      error: (e) => {
        console.error('Error al obtener las categorías:', e);
        this.categorias = [];
      }
    });
  }

  getColorForPriority(prioridad: { label: string; color: string } | null | undefined): string {
    if (!prioridad) return 'transparent';

    switch (prioridad.label) {
      case 'Alta': return 'red';
      case 'Media': return 'orange';
      case 'Baja': return 'green';
      default: return 'gray';
    }
  }

  onSubmit(): void {
    const cNombreUsuario = this._mainSharedService.datosUsuario()?.cColaborador;
    const cAreaUsuario = this._mainSharedService.datosUsuario()?.cArea;
    const nUniOrgCodigo = this.form.get('area')?.value;
    const idCategoria = this.form.get('categoria')?.value;
    const dFechaIncidente = this.form.get('fecha')?.value;
    const cLugarIncidente = this.form.get('lugar')?.value;
    const idPrioridad = this.form.get('prioridad')?.value;
    const cDetalleServicio = this.form.get('detalle')?.value;
    const cPerJuridica = this._mainSharedService.datosPersonales()?.cperjuridica;
    const cUsuarioCorreo = this._mainSharedService.datosPersonales()?.cPerMaiNombre;
    const cIpUsuario = this.getIp();
    console.log("Nombres: ", cNombreUsuario);
    console.log("Area: ",cAreaUsuario);
    console.log("Escuela Destino", nUniOrgCodigo);
    console.log("Categoria: ",idCategoria);
    console.log("Fecha del Incidente: ", dFechaIncidente);
    console.log("Lugar del Incidente: ", cLugarIncidente);
    console.log("Prioridad: ", idPrioridad);
    console.log("Detalle: ", cDetalleServicio);
    console.log("cPerJuridica", cPerJuridica);
    console.log("Correo: ", cUsuarioCorreo);
    console.log("IP:", cIpUsuario);
  }

  // Método auxiliar para convertir la etiqueta de prioridad a su valor numérico
  obtenerValorPrioridad(etiquetaPrioridad: string): number {
    switch (etiquetaPrioridad) {
      case 'Alta': return 1;
      case 'Media': return 2;
      case 'Baja': return 3;
      default: return 1; // Valor por defecto
    }
  }
}