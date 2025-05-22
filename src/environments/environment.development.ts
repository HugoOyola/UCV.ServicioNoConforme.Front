import { routes } from './endpoints';
export const environment = {
	production: false,
	local: false,
	configInterceptor: {
		MAXIMO_INTENTOS: 10,
		TIEMPO_ESPERA_MS: 3000,
	},

	// *Api Ip
	ip: 'https://api.ipify.org/?format=json',

	// *Api redireccio
	redireccion: 'https://trilce-qa.ucv.edu.pe/default.aspx',

	// *Apis
	ls_apis: {
		trilceapi2: {
			token: {
				name: 'trilceapi2',
				user: 'og5xgX458yx8pDVB5UpWgNabxL8a',
				pass: '7RluNM9ox3T1UR7xOv0EONCo4Nka',
				tokenUrl: 'https://ucvapi.azure-api.net/jwttrilce/v1/api/Token/Login',
			},
			routes: {
				trilceprincipal2: {
					...routes.trilceprincipal2,
				},
			},
		},
		ConfiguracionCalidad: {
			token: {
				name: 'ConfiguracionCalidad',
				user: 'kcH5DQtpuWyRt9W1LD0jQ7wZlbCB',
				pass: 'd65xRfD71x8UcfFYwcV06eyvd6ie',
				tokenUrl: 'https://ucvapi.azure-api.net/jwttrilce/v1/api/Token/Login',
			},
			routes: {
				gestorconfiguracioncalidad: {
					url: 'https://ucvapi.azure-api.net/gestorconfiguracioncalidad/v2/api/',
					//url: 'http://localhost/Api_Calidad/api/',
					...routes.ConfiguracionCalidad,
				}
			}
		},
		ServicioNoConforme: {
			token: {
				name: 'ServicioNoConforme',
				user: 'kcH5DQtpuWyRt9W1LD0jQ7wZlbCB',
				pass: 'd65xRfD71x8UcfFYwcV06eyvd6ie',
				tokenUrl: 'https://ucvapi.azure-api.net/jwttrilce/v1/api/Token/Login',
			},
			routes: {
				apinoconformidades: {
					url: 'https://ucvapi.azure-api.net/apinoconformidades/qa/api/',
					...routes.ServicioNoConforme,
				},
			},
		}
	},
};
