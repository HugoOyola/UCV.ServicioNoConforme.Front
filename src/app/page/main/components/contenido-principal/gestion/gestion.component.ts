import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { VistaCoordinadorComponent } from "./vista-coordinador/vista-coordinador.component";
import { VistaAreaComponent } from './vista-area/vista-area.component';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    RadioButtonModule,
    FormsModule,
    VistaCoordinadorComponent,
    VistaAreaComponent
  ],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.scss'
})
export class GestionComponent {
  public selectedManagementType: string = 'coordinator';
  public totalServices: number = 25;
  public highPriorityServices: number = 6;
  public mediumPriorityServices: number = 8;
  public lowPriorityServices: number = 11; // ✅ Agregar esta propiedad

  constructor() {}

  onManagementTypeChange(): void {
    console.log('Tipo de gestión seleccionado:', this.selectedManagementType);

    if (this.selectedManagementType === 'coordinator') {
      this.loadPendingServices();
    } else {
      this.loadAreaServices();
    }
  }

  getEmptyStateMessage(): string {
    return this.selectedManagementType === 'coordinator'
      ? 'No hay servicios pendientes de derivar'
      : 'No hay servicios derivados a tu área';
  }

  private loadPendingServices() {
    // Datos basados en los tickets reales del coordinador
    this.totalServices = 25;
    this.highPriorityServices = 6;  // Tickets con prioridad "Alta"
    this.mediumPriorityServices = 8; // Tickets con prioridad "Media"
    this.lowPriorityServices = 11;   // Tickets con prioridad "Baja"
  }

  private loadAreaServices() {
    // Simular datos para área
    this.totalServices = 18;
    this.highPriorityServices = 4;
    this.mediumPriorityServices = 6;
    this.lowPriorityServices = 8;
  }
}