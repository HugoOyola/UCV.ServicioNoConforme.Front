import { Component, HostListener, effect, inject } from '@angular/core';
import { MainService } from './services/main.service';
import { AuthService } from '@auth/auth.service';
import { SkeletonComponent } from '@shared/components/skeleon/skeleton.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { PerfilesSharedService } from '@shared/services/perfiles-shared.service';
import { EncryptionService } from '@auth/encryption.service';
import { MainSharedService } from '@shared/services/main-shared.service';
import { ModuleService } from '@shared/services/module.service';
import { ButtonModule } from 'primeng/button';
import { UsuarioInfoComponent } from "./components/usuario-info/usuario-info.component";
import { ContenidoPrincipalComponent } from "./components/contenido-principal/contenido-principal.component";

@Component({
	selector: 'app-main',
	standalone: true,
	imports: [CommonModule, SkeletonComponent, MatIconModule, MatButtonModule, ButtonModule, UsuarioInfoComponent, ContenidoPrincipalComponent],
	providers: [MainService],
	templateUrl: './main.component.html',
	styleUrl: './main.component.scss',
})
export class MainComponent {
	private _authService = inject(AuthService);
	private _mainService = inject(MainService);
	public _mainSharedService = inject(MainSharedService);
	public _perfilesSharedService = inject(PerfilesSharedService);
	public _moduleService = inject(ModuleService);
	public _encryptionService = inject(EncryptionService);

	constructor() {
		this.cargarDatosNuevos('7000090106');
		// this.cargarDatosNuevos('7000061020');

		effect(() => {
			const cPerCodigoSignal = this._mainSharedService.cPerCodigo();
			console.log(' =>', cPerCodigoSignal);
			if (cPerCodigoSignal !== '') {
				console.log(' =>', cPerCodigoSignal);
				this._authService.ReloadToken().subscribe({
					complete: () => {
						this.post_Principal_ObtenerDatosPersonales();
					},
				});
			}
		});
		// this.cargarDatosNuevos('2000067902');
	}

	@HostListener('window:message', ['$event'])
	onMessage(event: MessageEvent): void {
		if (this._mainSharedService.cPerCodigo() === '') {
			// console.log('😎😋 =>', event.source);
			if (event.source) {
				// Verificar el origen para mayor seguridad
				// console.log('event.data =>', event.data);
				// const data_cPercodigo = event.data.cPercodigo;
			}
		}
	}

	cargarDatosNuevos(cPerCodigo: string): void {
		this._mainSharedService.cPerCodigo.set(cPerCodigo);
	}

	post_Principal_ObtenerDatosPersonales(): void {
		if (this._mainSharedService.datosPersonales() === null) {
			this._mainService.post_Principal_ObtenerDatosPersonales(this._mainSharedService.cPerCodigo()).subscribe({
				next: (v) => {
					console.log('v =>', v);
					this._mainSharedService.datosPersonales.set(v.body?.lstItem[0] ?? null);
					this.post_Global_LR_ObtenerPerfiles();
				},
				error: (e) => { },
				complete: () => { },
			});
		}
	}

	post_Global_LR_ObtenerPerfiles():void{
    const nSisGruCodigo = 117;
    const nSisGruTipo = 1063;
    const nObjTipo = 1061;
    if (this._mainSharedService.cPerCodigo() !== '') {
      this._mainService.post_Global_ObtenerPerfilesCalidad(this._mainSharedService.cPerCodigo(),nSisGruCodigo,nSisGruTipo,nObjTipo).subscribe({
        next: (v) => {
          const cPerfiles = v.body?.item?.cPerfiles ?? null;
          const PerfilArray = cPerfiles.split(',').map((p: string) => Number(p.trim()));
					console.log(PerfilArray);
          this._mainSharedService.perfiles.set(PerfilArray);
        }
      })
    }
  }
}
