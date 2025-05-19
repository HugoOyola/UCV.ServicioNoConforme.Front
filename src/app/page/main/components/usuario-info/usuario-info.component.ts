import { Component, effect, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainSharedService } from '@shared/services/main-shared.service';
import { MainService } from '../../services/main.service';

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
  public _mainSharedService = inject(MainSharedService);
  private _mainService = inject(MainService);

  @Input() public professorData: ProfessorData = {
    name: 'Juan Pérez Rodríguez',
    foto: 'https://randomuser.me/api/portraits/men/28.jpg',
    email: 'juan.perez@ucv.edu.pe',
    position: 'Docente - Tiempo Completo',
    location: 'Trujillo',
    faculty: 'Facultad de Ingeniería',
    role: 'Coordinador Académico'
  };

  constructor() {
    effect(() => {
      const cPerCodigoSignal = this._mainSharedService.cPerCodigo();
      this.post_ServiciosNoConformesDetallePersonal();
      console.log('Prueba de cPerCodigoSignal:', cPerCodigoSignal);
    })
  }

  post_ServiciosNoConformesDetallePersonal(): void {
    if (this._mainSharedService.cPerCodigo() !== '') {
      this._mainService.post_ObtenerServicioDetallePersonal(this._mainSharedService.cPerCodigo()).subscribe({
        next: (v) => {
          // const cPerfiles = v.body?.item?.cPerfiles ?? null;
          // const PerfilArray = cPerfiles.split(',').map((p: string) => Number(p.trim()));
          //console.log(PerfilArray);
          // this._GlobalSharedService.perfiles.set(PerfilArray);
          console.log('Datos del personal:', v.body?.lstItem[0].cCargo);
        }
      })
    }
  }

  public getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}