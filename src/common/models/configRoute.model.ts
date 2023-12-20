import {type HttpHeaders} from '../enums/httpHeaders.enum';
import {type HttpMethods} from '../enums/httpMethods.enum';

export type ConfigRouteModel = {
	prefix: string;
	host: string;
	serviceId?: number | string;
	allowedMethods?: HttpMethods[] | string;
	allowedHeaders?: HttpHeaders[] | string;
};
