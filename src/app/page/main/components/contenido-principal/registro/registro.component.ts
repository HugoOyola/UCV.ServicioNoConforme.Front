import { Component, OnInit, effect, inject } from '@angular/core';
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
  private _mainService = inject(MainService);
  private _mainSharedService = inject(MainSharedService);

  public maxDate: Date = new Date();
  public form: FormGroup;

  // Lista de unidades académicas
  public unidadesAcademicas: UnidadAcademica[] = [];
  // Lista de áreas para el select
  public areas: AreaOption[] = [];

  public prioridades = [
    { label: 'Baja', color: 'bg-green-500' },
    { label: 'Media', color: 'bg-yellow-400' },
    { label: 'Alta', color: 'bg-red-500' },
  ];

  // En el componente, actualizar la definición de categorias
  public categorias: CategoriaOption[] = [];

  constructor(private fb: FormBuilder) {
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
      const cPerCodigoSignal = this._mainSharedService.cPerCodigo();
      this.cargarUnidadesAcademicas();
      console.log('Prueba de cPerCodigoSignal:', cPerCodigoSignal);
    });
  }

  ngOnInit(): void {
    // Cargar unidades académicas al iniciar
    if (this._mainSharedService.cPerCodigo() !== '') {
      this.cargarUnidadesAcademicas();
    }
    // Cargar las categorías
    this.cargarCategorias();
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
    this._mainService.post_ObtenerServicioListadoEscuelas(cPerJuridica).subscribe({
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
    if (this.form.valid) {
      console.log(this.form.getRawValue());
    } else {
      this.form.markAllAsTouched();
    }
  }
}