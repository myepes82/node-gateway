import {ApiGateway} from '.';

const gateway = new ApiGateway({
	configFile: false,
	port: 8080,
	hosts: [
		{
			serviceId: 'json place holder',
			prefix: '/posts',
			host: 'https://jsonplaceholder.typicode.com/posts',
		},
	],
});

gateway.register({
	prefix: '/roaster',
	serviceId: 'test_server',
	host: 'http://localhost:4000',
});
void gateway.init();
