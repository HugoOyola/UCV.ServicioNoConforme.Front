export const routes = {
	trilceprincipal2: {
		url: 'https://ucvapi.azure-api.net/trilceprincipal2/v1/api/',
		endpoints: {
			//% Principal
			Principal_ObtenerDatosPersonales: 'Principal/ObtenerDatosPersonales',
		},
	},
	ConfiguracionCalidad: {
		endpoints: {
			Calidad_Perfiles: 'ControlConfiguracion/PerfilCalidad',
		}
	},
	ServicioNoConforme: {
		endpoints: {
			Snc_DetallePersonal: 'IncidenciasNC/DetallePersonalNC',
			Snc_ListadoEscuelas: 'IncidenciasNC/UnidadAcademicaNC',
			Snc_ListadoCategoria: 'IncidenciasNC/CategoriasNC',
			Snc_GuardarServicio: 'IncidenciasNC/GuardarServicioNC',
			Snc_ListadoIncidencias: 'IncidenciasNC/ListadoServicioNC'
		}
	}
};
