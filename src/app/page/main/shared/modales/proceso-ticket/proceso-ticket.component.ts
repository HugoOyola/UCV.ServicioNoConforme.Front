import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proceso-ticket',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './proceso-ticket.component.html',
  styleUrl: './proceso-ticket.component.scss'
})
export class ProcesoTicketComponent {
  @Input() public visible: boolean = false;
  @Output() public btnCerrar: EventEmitter<void> = new EventEmitter<void>();

  close(): void {
    this.btnCerrar.emit();
  }
}