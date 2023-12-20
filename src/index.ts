import {ServerEntity} from './domain/server.entity';
import {type ConfigServerModel} from './common/models/configServer.model';
import {type StarterModel} from './common/models/starter.model';
import {type ConfigRouteModel} from './common/models/configRoute.model';
import {logError} from './common/utils/logger';

/**
 * Represents a ApiGateway application responsible for managing server configuration and initialization.
 */
export class ApiGateway {
	/**
   * Configuration for the server.
   * @private
   */
	private readonly _configuration: ConfigServerModel;

	/**
   * Instance of the ServerEntity class.
   * @private
   */
	private readonly _server: ServerEntity;

	/**
   * Creates an instance of the Gateway class.
   * @param {StarterModel} starter - Object containing startup parameters.
   */
	constructor(starter: StarterModel) {
		this._configuration = this.buildConfig(starter);
		this._server = new ServerEntity(this._configuration);
	}

	/**
   * Registers a new service configuration.
   * @param {ConfigRouteModel} service - Service configuration to be registered.
   */
	public register(service: ConfigRouteModel): void {
		this._configuration.services = this._configuration.services.concat(service);
		this._server.addHostService(service);
	}

	/**
   * Initializes the server and executes a post-init function.
   * @param {Function} f - Post-init function to be executed.
   * @returns {Promise<any>} - A Promise that resolves after the server is initialized and the post-init function is executed.
   */
	public async init(f?: (...args: any[]) => void): Promise<void> {
		this._server.init();
		if (f) {
			try {
				f();
			} catch (error: any) {
				logError('Error at post execution __init() method: {}', JSON.stringify(error));
				throw error as Error;
			}
		}
	}

	/**
   * Builds the server configuration based on the starter parameters.
   * @private
   * @param {StarterModel} starter - Object containing startup parameters.
   * @returns {ConfigServer} - Server configuration.
   */
	private buildConfig(starter: StarterModel): ConfigServerModel {
		const {port, hosts} = starter;
		const parsedPort: number | undefined = typeof port === 'string' ? parseInt(port, 10) : port;
		const usePort: number = parsedPort ?? 8080;
		return {
			port: usePort,
			services: hosts ?? [] as ConfigRouteModel[],
		} satisfies ConfigServerModel;
	}
}
