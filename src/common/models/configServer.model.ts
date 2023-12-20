import {type ConfigRouteModel} from './configRoute.model';

export type ConfigServerModel = {
	port: number;
	services: ConfigRouteModel[];
};
