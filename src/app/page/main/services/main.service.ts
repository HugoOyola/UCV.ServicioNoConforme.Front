import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { ResponseResultLst, ResponseResultItem } from '@interface/responseResult.interface';
import { GlobalService } from '@shared/services/global.service';
import { Observable } from 'rxjs';
import { ObtenerDatosPersonales } from '../interface/principal';

@Injectable()
export class MainService extends GlobalService {
	private TrilcePrincipal = environment.ls_apis.trilceapi2.routes.trilceprincipal2;
	private ApiServicioNC = environment.ls_apis.ServicioNoConforme.routes.apinoconformidades;
	private ApiPerfilGlobal = environment.ls_apis.ConfiguracionCalidad.routes.gestorconfiguracioncalidad;

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

	post_ObtenerServicioListadoEscuelas(cperjuridica: string, ntipounidad: number): Observable<HttpResponse<ResponseResultLst<any>>> {
		const param = {
			cPerJuridica: cperjuridica,
			nTipoUnidad: ntipounidad
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

	post_GuardarServicioNC(
		datos: {
			cPerCodigo: string,
			nUniOrgCodigo: number,
			idCategoria: number,
			dfechaIncidente: string,
			cLugarIncidente: string,
			idPrioridad: number,
			cDetalleServicio: string,
			cPerJuridica: string,
			cUsuarioCorreo: string,
			cIpUsuario: string
		}
	): Observable<HttpResponse<ResponseResultLst<any>>> {
		const ling = this.ApiServicioNC.url + this.ApiServicioNC.endpoints.Snc_GuardarServicio;
		return this._http.post<ResponseResultLst<any>>(ling, datos, {
			headers: this.headers_a_json,
			observe: 'response',
		});
	}

	post_Global_ObtenerPerfilesCalidad(cPerCodigo: string, nSisGruCodigo: number, nSisGruTipo: number, nObjTipo: number): Observable<HttpResponse<ResponseResultItem<any>>>{
    const param = {
      cPerCodigo : cPerCodigo,
      nSisGruCodigo: nSisGruCodigo,
      nSisGruTipo: nSisGruTipo,
      nObjTipo: nObjTipo
    };
    const ling =  this.ApiPerfilGlobal.url + this.ApiPerfilGlobal.endpoints.Calidad_Perfiles;
    return this._http.post<ResponseResultItem<any>>(ling, param, {
      headers: this.headers_a_json,
      observe: 'response',
    });
  }

	post_ObtenerListadoServiciosNC(cPerCodigo: string): Observable<HttpResponse<ResponseResultLst<any>>> {
		const param = {
			cPerCodigo: cPerCodigo,
		};

		const ling = this.ApiServicioNC.url + this.ApiServicioNC.endpoints.Snc_ListadoIncidencias;
		return this._http.post<ResponseResultLst<any>>(ling, param, {
			headers: this.headers_a_json,
			observe: 'response',
		});
	}

	put_EditarServicioNC(
		datos: {
			cPerCodigo: string,
			idNoConformidad: number,
			idCategoria: number,
			dfechaIncidente: string,
			cLugarIncidente: string,
			idPrioridad: number,
			cDetalleServicio: string,
			idCodigoNC: string
		}
	): Observable<HttpResponse<ResponseResultItem<any>>> {
		const ling = this.ApiServicioNC.url + this.ApiServicioNC.endpoints.Snc_EditarIncidencias; // Endpoint para editar
		return this._http.put<ResponseResultItem<any>>(ling, datos, {
			headers: this.headers_a_json,
			observe: 'response',
		});
	}

	// Agregar este método al MainService (reemplazar el método vacío)
	put_EliminarServicioNC(cPerCodigo: string, idNoConformidad: number): Observable<HttpResponse<ResponseResultItem<any>>> {
		const param = {
			cPerCodigo: cPerCodigo,
			idNoConformidad: idNoConformidad
		};

		const ling = this.ApiServicioNC.url + this.ApiServicioNC.endpoints.Snc_EliminarServicio; // Asumiendo que existe este endpoint
		return this._http.put<ResponseResultItem<any>>(ling, param, {
			headers: this.headers_a_json,
			observe: 'response',
		});
	}
}
