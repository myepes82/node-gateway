import {type ConfigRouteModel} from '../common/models/configRoute.model';
import {type ConfigServerModel} from '../common/models/configServer.model';
import {type Server, createServer, type IncomingMessage, type ServerResponse} from 'http';
import {createProxyServer} from 'http-proxy';
import {logDebug, logWarn, logError, logInfo} from '../common/utils/logger';
import {requestLoggerMiddleware} from '../common/middlewares/requestLogger.middleware';

/**
 * Represents a server entity with proxy capabilities.
 */
export class ServerEntity {
	/**
   * Port on which the server listens for requests.
   */
	protected readonly _port: number;

	/**
   * Configuration for dynamic routes associated with hosts.
   */
	protected readonly _hosts: Record<string, ConfigRouteModel>;

	/**
   * Instance of the proxy server.
   */
	protected proxy: ReturnType<typeof createProxyServer>;

	/**
   * Instance of the HTTP server.
   */
	protected server: Server;

	/**
   * Creates an instance of ServerEntity.
   * @param {ConfigServerModel} config - Server configuration.
   */
	constructor(config: ConfigServerModel) {
		const {port, services} = config;
		this._port = port;
		this._hosts = this.buildDynamicRoutes(services);

		this.proxy = createProxyServer({});
		this.proxy.on('error', this.handleError.bind(this));

		this.server = createServer();
		this.server.on('request', this.handleRequest.bind(this));
	}

	/**
   * Initializes the server, starting to listen on the specified port.
   */
	public init(): void {
		this.server.listen(this._port, () => {
			logDebug('Server running on port: {}', this._port.toString());
		});
	}

	/**
   * Closes the server and the proxy server.
   */
	public close(): void {
		logWarn('Starting server shutdown');
		this.server.close((err: Error | undefined) => {
			if (err) {
				logError('Error closing server: {}', JSON.stringify(err));
			}

			logDebug('Server closed');
		});
		this.proxy.close(() => {
			logDebug('ProxyServer closed');
		});
		logInfo('Server shutdowns');
	}

	public addHostService(host: ConfigRouteModel): void {
		this._hosts[host.prefix] = host;
	}

	/**
   * Handles incoming HTTP requests, routing to the corresponding hosts.
   * @param {IncomingMessage} req - Incoming HTTP request object.
   * @param {ServerResponse} res - Server response object.
   */
	private handleRequest(req: IncomingMessage, res: ServerResponse): void {
		const {url} = req;

		requestLoggerMiddleware(req);
		const route = this._hosts[url ?? ''];
		if (!route) {
			const message = 'host not found';
			res.writeHead(404, {'Content-Type': 'text/plain'});
			logError(message);
			res.end(message);
		}

		this.proxy?.web(req, res, {target: route.host}, err => {
			if (err) {
				this.handleError(err, req, res);
			}
		});
	}

	/**
   * Handles errors from the proxy server and responds with a 500 status code.
   * @param {Error} err - Error object.
   * @param {IncomingMessage} _ - Incoming HTTP request object.
   * @param {ServerResponse} res - Server response object.
   */
	private handleError(err: Error, _: any, res: any): void {
		const message = `Proxy error: ${err.message}`;
		logError(message);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		res?.writeHead(500, {'Content-Type': 'text/plain'});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		res?.end(message);
	}

	/**
   * Builds dynamic routes from the services configuration.
   * @param {ConfigRouteModel[]} services - Services configuration.
   * @returns {Record<string, ConfigRouteModel>} - Dynamic routes associated with hosts.
   */
	private buildDynamicRoutes(services: ConfigRouteModel[]): Record<string, ConfigRouteModel> {
		return services.reduce<Record<string, ConfigRouteModel>>((result, service) => {
			const key = service.prefix;
			result[key] = service;
			return result;
		}, {});
	}
}
