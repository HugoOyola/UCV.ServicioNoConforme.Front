import {Injectable, signal} from '@angular/core';
import {ObtenerDatosPersonales, ObtenerDatosUsuarios} from '../../../page/main/interface/principal';

@Injectable({
	providedIn: 'root',
})
export class MainSharedService {
	public cPerCodigo = signal<string>('');
	public datosUsuario = signal<ObtenerDatosUsuarios | null>(null);
	public perfiles = signal<number[]>([]);

	// % datos personales
	public datosPersonales = signal<ObtenerDatosPersonales | null>(null);
}
