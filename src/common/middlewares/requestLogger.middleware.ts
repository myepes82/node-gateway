import {type Server, createServer, type IncomingMessage, type ServerResponse} from 'http';
import {logInfo} from '../utils/logger';
export function requestLoggerMiddleware(req: IncomingMessage): void {
	const {method, url} = req;
	logInfo(`${method} call to ${url}`);
}
