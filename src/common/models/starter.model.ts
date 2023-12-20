import {type ConfigRouteModel} from './configRoute.model';

export type StarterModel = {
	configFile: boolean;
	port?: number | string;
	hosts?: ConfigRouteModel[];
};
