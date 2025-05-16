import { Component } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectModule, DatePickerModule, RadioButtonModule, InputTextModule, TextareaModule, ButtonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  public maxDate: Date = new Date();
  public form: FormGroup;

  public prioridades = [
    { label: 'Baja', color: 'bg-green-500' },
    { label: 'Media', color: 'bg-yellow-400' },
    { label: 'Alta', color: 'bg-red-500' },
  ];

  public categorias = [
    { name: 'Infraestructura', value: 'Infraestructura' },
    { name: 'Servicios académicos', value: 'Servicios académicos' },
    { name: 'Atención al estudiante', value: 'Atención al estudiante' },
    { name: 'Docencia', value: 'Docencia' },
    { name: 'Administrativo', value: 'Administrativo' },
    { name: 'Biblioteca', value: 'Biblioteca' },
    { name: 'Laboratorios', value: 'Laboratorios' },
    { name: 'Tecnología', value: 'Tecnología' },
    { name: 'Seguridad', value: 'Seguridad' },
    { name: 'Otros', value: 'Otros' },
  ];

  public areas = [
    { name: 'Facultad de Ingeniería', value: 'Ingeniería' },
    { name: 'Facultad de Ciencias de la Salud', value: 'Salud' },
    { name: 'Facultad de Derecho', value: 'Derecho' },
    { name: 'Facultad de Ciencias Empresariales', value: 'Empresariales' },
    { name: 'Facultad de Educación', value: 'Educación' },
    { name: 'Facultad de Humanidades', value: 'Humanidades' },
    { name: 'Escuela de Postgrado', value: 'Postgrado' },
    { name: 'Dirección de Bienestar Universitario', value: 'Bienestar' },
    { name: 'Oficina de Admisión', value: 'Admisión' },
    { name: 'Oficina de Registros Académicos', value: 'Registros' },
    { name: 'Departamento de Tecnologías de Información', value: 'TI' },
    { name: 'Área de Servicios Generales', value: 'Servicios' },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      area: ['', Validators.required],
      categoria: ['', Validators.required],
      prioridad: ['', Validators.required],
      fecha: [''],
      lugar: [''],
      detalle: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
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