import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contenido-principal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contenido-principal.component.html',
  styleUrl: './contenido-principal.component.scss'
})
export class ContenidoPrincipalComponent {
  public activeTab: 'registro' | 'listado' | 'gestion' | 'historial' = 'registro';

}
