import {readFileSync, readdirSync} from 'fs';
import merge from 'lodash/merge'; // eslint-disable-line import/no-extraneous-dependencies
import {printBanner} from '../banner';
import yaml from 'yaml';

interface ISeries {
	name: string;
	maxPrice?: number;
}

interface IPage {
	backoff: {
		max: number;
		min: number;
	};
	inStockWaitTime: number;
	sleep: {
		max: number;
		min: number;
	};
	timeout: number;
}

interface IMerchandise {
	brands?: string[];
	microCenterLocation?: string[];
	models?: Array<{
		name: string;
		series?: ISeries[];
	}>;
	series?: ISeries[];
	stores?: Array<{
		autoAddToCard?: boolean;
		name: string;
		page?: IPage;
	}>;
}

interface IConfig {
	ascii?: {
		banner: boolean;
		color: string;
	};
	browser: {
		headless: boolean;
		height: number;
		lowBandwidth?: boolean;
		incognito?: boolean;
		open: boolean;
		page: IPage;
		screenshot: boolean;
		trusted?: boolean;
		width: number;
	};
	docker: boolean;
	merchandise?: IMerchandise;
	notification?: {
		desktop?: boolean;
		discord?: Array<{
			webhook: string;
			roles: string[];
		}>;
		email?: {
			password?: string;
			smtp?: {
				address: string;
				port: number;
			};
			to: string;
			username: string;
		};
		mqtt?: {
			address: string;
			clientId: string;
			password: string;
			port: number;
			qos: number;
			topic: string;
			username: string;
		};
		pagerduty?: {
			routingKey: string;
			severity: string;
		};
		philipsHue?: {
			apiKey?: string;
			cloud?: {
				accessToken: string;
				clientId: string;
				clientSecret: string;
				refreshToken: string;
			};
			lan?: {
				address: string;
			};
			light?: {
				color: string;
				ids: string[];
				pattern: string;
			};
		};
		phone?: Array<{
			carrier: string;
			number: string;
		}>;
		pushbullet?: {
			apiKey: string;
		};
		pushover?: {
			expire: number;
			priority: number;
			retry: number;
			username: string;
			token: string;
		};
		slack?: Array<{
			channels: string[];
			token: string;
		}>;
		sound?: {
			filename: string;
			player?: string;
		};
		telegram?: {
			token: string;
			chatIds: string[];
		};
		twilio?: {
			accountId: string;
			token: string;
			from: string;
			to: string;
		};
		twitch?: {
			channel: string;
			clientId: string;
			clientSecret: string;
			refreshToken: string;
			accessToken: string;
		};
		twitter?: {
			accessTokenKey: string;
			accessTokenSecret: string;
			consumerKey: string;
			consumerSecret: string;
			hashtags?: string[];
		};
	};
	logLevel: string;
	proxies?: string[];
}

const defaultConfig: IConfig = {
	browser: {
		headless: true,
		height: 1080,
		open: true,
		page: {
			backoff: {
				max: 30000,
				min: 10000
			},
			inStockWaitTime: 10000,
			sleep: {
				max: 30000,
				min: 10000
			},
			timeout: 10000
		},
		screenshot: true,
		width: 1920
	},
	docker: process.env.DOCKER ? process.env.DOCKER === 'true' : false,
	logLevel: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'
};

function configFactory(): IConfig {
	const files = readdirSync('src/config/');

	let config: IConfig = defaultConfig;

	files.forEach((file: string) => {
		if (file.includes('yaml')) {
			config = merge(
				config,
				yaml
					.parseDocument(readFileSync(`src/config/${file}`, 'utf8'), {
						sortMapEntries: true
					})
					.toJSON()
			);
		}
	});

	return config;
}

export const config = configFactory();

printBanner(config.ascii?.banner, config.ascii?.color);
