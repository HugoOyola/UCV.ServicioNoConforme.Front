import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { VistaCoordinadorComponent } from "./vista-coordinador/vista-coordinador.component";
import { VistaAreaComponent } from './vista-area/vista-area.component';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [
    CommonModule,
    RadioButtonModule,
    FormsModule,
    VistaCoordinadorComponent,
    VistaAreaComponent
  ],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.scss'
})
export class GestionComponent {
  public selectedManagementType: string = '';

  selectManagementType(type: string): void {
    this.selectedManagementType = type;
    this.onManagementTypeChange();
  }

  onManagementTypeChange(): void {
    // Lógica adicional cuando cambia el tipo de gestión
    if (this.selectedManagementType === 'coordinator') {
      console.log('Modo coordinador seleccionado');
      // Aquí puedes agregar lógica específica para coordinador
      // Ejemplo: cargar servicios pendientes de derivar
    } else if (this.selectedManagementType === 'area') {
      console.log('Modo área seleccionado');
      // Aquí puedes agregar lógica específica para área
      // Ejemplo: cargar servicios derivados al área
    }
  }
}