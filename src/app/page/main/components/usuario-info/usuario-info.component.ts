import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ProfessorData {
  name: string;
  email: string;
  foto: string;
  position: string;
  location: string;
  faculty: string;
  role: string;
}

@Component({
  selector: 'app-usuario-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario-info.component.html',
  styleUrl: './usuario-info.component.scss'
})
export class UsuarioInfoComponent {
  @Input() public professorData: ProfessorData = {
    name: 'Juan Pérez Rodríguez',
    foto: 'https://randomuser.me/api/portraits/men/28.jpg',
    email: 'juan.perez@ucv.edu.pe',
    position: 'Docente - Tiempo Completo',
    location: 'Trujillo',
    faculty: 'Facultad de Ingeniería',
    role: 'Coordinador Académico'
  };

  constructor() { }

  public getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}