// import { ObtenerDatosPersonales } from './principal';
export interface centrosEmpre {
	titulo: 'PREGRADO' | 'POSTGRADO' | 'EXTERNO';
	primercodigo: string;
	segundocodigo: string;
	tercercodigo: string;
	cuartocodigo: string;
	nombre: string;
}

export interface ObtenerDatosUsuarios{
	cPerCodigo: string,
	emplid: string,
	idSupervisor: string,
	cCargo: string,
	cTipoPersonal : string,
	cPuesto: string,
	cArea: string,
	cDocumento: string,
	cColaborador: string,
	cMailCorp: string,
	cMailPer: string,
	cPerJuridica: string,
	cPerApellido: string,
	cFotoLink: string,
}
export interface ObtenerDatosPersonales {
	cPerCodigo: string;
	cPerApellido: string;
	cPerApellidoPaterno: string;
	cPerApellidoMaterno: string;
	cPerApellidoCasada: string;
	cPerNombre: string;
	TipoContrato: string;
	EsDocente: number;
	dPerNacimiento: string;
	nPerEstado: number;
	nPerTipo: number;
	cUbiGeoCodigo: string;
	cLugarConcatenado: string;
	nPerNatSexo: number;
	cPerNatSexoDes: string;
	nPerNatEstCivil: number;
	cPerNatEstCivilDes: string;
	nPerNatTipResidencia: number;
	nPerNatSitLaboral: number;
	nPerNatOcupacion: number;
	TipoDI: number;
	DI: string;
	DNI: string;
	cDocIde: string;
	PEOPLE: string;
	cperjuridica: string;
	nUniOrgCodigo: number;
	cUniOrgNombre: string;
	cPerTelNumero: string;
	nPerAluRegEstado: number;
	Ciclo: number;
	Parientes: string;
	nAdmSolCodigo: number;
	nSProCodigo: number;
	nProCodigo: number;
	cFilial: string;
	cPerMaiNombre: string;
	bEvaluarDocente: boolean;
	bPerfilMigrado: boolean;
	PositionPS: string;
	PositionDptPS: string;
	dFechaUpdate: Date;
	cUsuUpdate: string;
	Mailrecupe: string;
	MayorGradoObtenido: string;
	Categoria: string;
	MailBoleta: string;
	nSedCodigo: number;
	cPerUsuCodigo: string;
	SemestreIngreso: string;
	PeriodoCard: string;
	permail_dbu: string;
	pertelefono_dbu: string;
}
