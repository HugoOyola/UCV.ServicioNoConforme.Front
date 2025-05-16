import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroComponent } from "./registro/registro.component";
import { ListadoComponent } from "./listado/listado.component";
import { GestionComponent } from "./gestion/gestion.component";
import { HistorialComponent } from "./historial/historial.component";

@Component({
  selector: 'app-contenido-principal',
  standalone: true,
  imports: [CommonModule, RegistroComponent, ListadoComponent, GestionComponent, HistorialComponent],
  templateUrl: './contenido-principal.component.html',
  styleUrl: './contenido-principal.component.scss'
})
export class ContenidoPrincipalComponent {
  // Tab activo por defecto
  public activeTab: 'registro' | 'listado' | 'gestion' | 'historial' = 'registro';

  // Método para cambiar el tab activo
  cambiarTab(tab: 'registro' | 'listado' | 'gestion' | 'historial'): void {
    this.activeTab = tab;
  }
}
