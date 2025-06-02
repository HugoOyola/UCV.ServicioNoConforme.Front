// eliminar-ticket.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

// Interface unificada - usando la misma nomenclatura que vista-coordinador y listado
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
  selector: 'app-eliminar-ticket',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './eliminar-ticket.component.html',
  styleUrls: ['./eliminar-ticket.component.scss']
})
export class EliminarTicketComponent {
  @Input() public visible: boolean = false;
  @Input() public ticket: Ticket | null = null;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();
  @Output() public confirmarEliminacion: EventEmitter<Ticket> = new EventEmitter<Ticket>();

  close(): void {
    this.btnCerrar.emit();
  }

  confirmarEliminar(): void {
    if (this.ticket) {
      this.confirmarEliminacion.emit(this.ticket);
    }
  }

  // Método helper para obtener el código del servicio
  getCodigoServicio(): string {
    if (!this.ticket) return '';
    return this.ticket.cCodigoServ || this.ticket.idCodigoNC || 'No especificado';
  }

  // Método helper para obtener la categoría
  getCategoria(): string {
    if (!this.ticket) return '';
    return this.ticket.descripcionCat || this.ticket.descripcion || 'No especificado';
  }
}