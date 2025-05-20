import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { ResponseResultLst } from '@interface/responseResult.interface';
import { GlobalService } from '@shared/services/global.service';
import { Observable } from 'rxjs';
import { ObtenerDatosPersonales } from '../interface/principal';

@Injectable()
export class MainService extends GlobalService {
	private TrilcePrincipal = environment.ls_apis.trilceapi2.routes.trilceprincipal2;
	private ApiServicioNC = environment.ls_apis.ServicioNoConforme.routes.apinoconformidades;

	constructor() {
		super();
	}
	// params: {showSpinner: false},
	post_Principal_ObtenerDatosPersonales(cPerCodigo: string): Observable<HttpResponse<ResponseResultLst<ObtenerDatosPersonales>>> {
		const param = { cPerCodigo };
		const ling = this.TrilcePrincipal.url + this.TrilcePrincipal.endpoints.Principal_ObtenerDatosPersonales;
		return this._http.post<ResponseResultLst<ObtenerDatosPersonales>>(ling, param, {
			headers: this.headers_a_json,
			observe: 'response',
		});
	}

	post_ObtenerServicioDetallePersonal(cpercodigo: string): Observable<HttpResponse<ResponseResultLst<any>>> {
		const param = {
			cPerCodigo: cpercodigo,
		};

		const ling = this.ApiServicioNC.url + this.ApiServicioNC.endpoints.Snc_DetallePersonal;
		return this._http.post<ResponseResultLst<any>>(ling, param, {
			headers: this.headers_a_json,
			observe: 'response',
		});
	}

	post_ObtenerServicioListadoEscuelas(cperjuridica: string): Observable<HttpResponse<ResponseResultLst<any>>> {
		const param = {
			cPerJuridica: cperjuridica,
		};

		const ling = this.ApiServicioNC.url + this.ApiServicioNC.endpoints.Snc_ListadoEscuelas;
		return this._http.post<ResponseResultLst<any>>(ling, param, {
			headers: this.headers_a_json,
			observe: 'response',
		});
	}

	post_ObtenerServicioListadoCategoria(nintcodigo: number, nintclase: number, ninttipo: number, cintjeraquia: string): Observable<HttpResponse<ResponseResultLst<any>>> {
		const param = {
			nIntCodigo: nintcodigo,
			nIntClase: nintclase,
			nIntTipo: ninttipo,
			cIntJerarquia: cintjeraquia
		};

		const ling = this.ApiServicioNC.url + this.ApiServicioNC.endpoints.Snc_ListadoCategoria;
		return this._http.post<ResponseResultLst<any>>(ling, param, {
			headers: this.headers_a_json,
			observe: 'response',
		});
	}
}
