// ver-ticket.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

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
  // Campos adicionales (pueden estar o no dependiendo del contexto)
  cCodigoServ?: string;
  nUniOrgCodigo?: number;
  cUniOrgNombre?: string;
  descripcionCat?: string;
  cPerCodigo?: string;
  cNombreUsuario?: string;
  cDepartamento?: string;
  usuarioCorreo?: string;
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

@Component({
  selector: 'app-ver-ticket',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TagModule, DateFormatPipe],
  templateUrl: './ver-ticket.component.html',
  styleUrl: './ver-ticket.component.scss'
})
export class VerTicketComponent {
  @Input() public visible: boolean = false;
  @Input() public ticket: Ticket | null = null;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();

  close(): void {
    this.btnCerrar.emit();
  }

  // Método helper para obtener la categoría (puede venir de diferentes campos)
  getCategoria(): string {
    if (!this.ticket) return '';
    return this.ticket.descripcionCat || this.ticket.descripcion || 'No especificado';
  }

  // Método helper para obtener el lugar/descripción
  getLugar(): string {
    if (!this.ticket) return '';
    return this.ticket.descripcionNC || this.ticket.cAreaDestino || 'No especificado';
  }

  // Método helper para obtener el código del servicio
  getCodigoServicio(): string {
    if (!this.ticket) return '';
    return this.ticket.cCodigoServ || this.ticket.idCodigoNC || 'No especificado';
  }
}