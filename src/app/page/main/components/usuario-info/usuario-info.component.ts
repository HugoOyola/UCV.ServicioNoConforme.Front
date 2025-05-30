import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainSharedService } from '@shared/services/main-shared.service';
import { MainService } from '../../services/main.service';
import { PersonalData } from './interface/personalData';
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

  // Use the interface for type safety
  public personalData: PersonalData | null = null;

  constructor() {
    effect(() => {
      const cPerCodigoSignal = this._mainSharedService.cPerCodigo();
      this.post_ServiciosNoConformesDetallePersonal();
      // console.log('Prueba de cPerCodigoSignal:', cPerCodigoSignal);
    })
  }

  post_ServiciosNoConformesDetallePersonal(): void {
    if (this._mainSharedService.cPerCodigo() !== '') {
      this._mainService.post_ObtenerServicioDetallePersonal(this._mainSharedService.cPerCodigo()).subscribe({
        next: (v) => {
          if (v.body?.lstItem.length && v.body?.lstItem.length > 0) {
            // Tipo de Respuesta en caso de que el servicio no retorne un valor
            this.personalData = v.body?.lstItem[0] as PersonalData;
            this._mainSharedService.datosUsuario.set(v.body?.lstItem[0] ?? null);
            console.log('Datos del personal:', this._mainSharedService.datosUsuario());
            // console.log('Datos del personal:', v.body?.lstItem[0].cCargo);

          // const cPerfiles = v.body?.item?.cPerfiles ?? null;
          // const PerfilArray = cPerfiles.split(',').map((p: string) => Number(p.trim()));
          //console.log(PerfilArray);
          // this._GlobalSharedService.perfiles.set(PerfilArray);
        }
      },
        error: (e) => {
          console.error('Error al obtener los datos del personal:', e);
          this.personalData = null;
        }
      });
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