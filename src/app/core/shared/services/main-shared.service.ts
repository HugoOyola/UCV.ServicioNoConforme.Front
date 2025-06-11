import {Injectable, signal} from '@angular/core';
import {ObtenerDatosPersonales, ObtenerDatosUsuarios} from '../../../page/main/interface/principal';

// Interface para los datos de seguimiento
interface DatosSeguimiento {
	tickets: any[];
	ultimaActualizacion?: Date;
	tipoGestion?: number;
}

@Injectable({
	providedIn: 'root',
})
export class MainSharedService {
	public cPerCodigo = signal<string>('');
	public datosUsuario = signal<ObtenerDatosUsuarios | null>(null);
	public perfiles = signal<number[]>([]);

	// % datos personales
	public datosPersonales = signal<ObtenerDatosPersonales | null>(null);

	// Signal para datos de seguimiento de servicios no conformes
	public datosSeguimiento = signal<DatosSeguimiento | null>(null);

	// Signal específico para el ticket seleccionado en gestión
	public ticketEnGestion = signal<any | null>(null);

	// Métodos para manejar los datos de seguimiento
	actualizarDatosSeguimiento(datos: any[], tipoGestion: number): void {
		this.datosSeguimiento.set({
			tickets: datos,
			ultimaActualizacion: new Date(),
			tipoGestion: tipoGestion
		});
	}

	// Método para establecer el ticket que se está gestionando
	establecerTicketEnGestion(ticket: any): void {
		this.ticketEnGestion.set(ticket);
	}

	// Método para limpiar el ticket en gestión
	limpiarTicketEnGestion(): void {
		this.ticketEnGestion.set(null);
	}

	// Método para obtener un ticket específico por ID
	obtenerTicketPorId(idCodigoNC:string): any | null {
		const datos = this.datosSeguimiento();
		if (!datos || !datos.tickets) return null;

		return datos.tickets.find(ticket => ticket.idCodigoNC === idCodigoNC) || null;
	}

	// Método para limpiar todos los datos de seguimiento
	limpiarDatosSeguimiento(): void {
		this.datosSeguimiento.set(null);
		this.ticketEnGestion.set(null);
	}
}