import {config as config_} from 'dotenv';
import fs from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import merge from 'lodash/merge';
import path from 'path';
import {printBanner} from '../banner';
import yaml from 'yaml';

interface IDiscord {
	hook: string;
	roles: string[];
}

interface IPhone {
	carrier: string;
	number: string;
}

interface ISlack {
	channels: string[];
	token: string;
}

interface ISelector {
	container: string;
	text?: string;
	euroFormat?: boolean;
}

interface ILink {
	brand: string;
	cartUrl?: string;
	maxPrice: number;
	model: string;
	series: string;
	url: string;
}

interface IStore {
	backOffStatusCodes: number[];
	labels: {
		captcha: ISelector[];
		inStock: ISelector[];
		maxPrice: ISelector[];
	};
	links: ILink[];
}

interface IConfig {
	ascii?: {
		banner: boolean;
		color: string;
	};
	browser: {
		headless: boolean;
		lowBandwidth?: boolean;
		incognito?: boolean;
		open: boolean;
		page: {
			backoff: {
				min: number;
				max: number;
			};
			height: number;
			inStockWaitTime?: number;
			sleep: {
				min: number;
				max: number;
			};
			timeout?: number;
			width: number;
		};
		screenshot: boolean;
		trusted?: boolean;
		userAgents?: string[];
	};
	docker?: boolean;
	stores?: IStore[];
	notification?: {
		desktop?: boolean;
		discord?: IDiscord[];
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
		phone?: IPhone[];
		pushbullet?: {
			apiKey: string;
		};
		pushover?: {
			token: string;
			username: string;
			priority: number;
		};
		slack?: ISlack[];
		sound?: string;
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
	proxy?: {
		address: string;
		protocol: string;
		port: number;
	};
}

const defaultConfig: IConfig = {
	browser: {
		headless: true,
		open: true,
		page: {
			backoff: {
				max: 3600000,
				min: 0
			},
			height: 1080,
			sleep: {
				max: 10000,
				min: 5000
			},
			width: 1920
		},
		screenshot: true
	},
	logLevel: 'info'
};

function configFactory(): IConfig {
	const files = fs.readdirSync('src/config/');

	let config: IConfig = defaultConfig;

	files.forEach(function (file) {
		if (file.includes('yaml')) {
			config = merge(
				config,
				yaml
					.parseDocument(fs.readFileSync(`src/config/${file}`, 'utf8'), {
						sortMapEntries: true
					})
					.toJSON()
			);
		}
	});

	return config;
}

export const configs = configFactory();

printBanner(configs.ascii?.banner, configs.ascii?.color);

config_({path: path.resolve(__dirname, '../../.env')});

/**
 * Returns environment variable, given array, or default array.
 *
 * @param environment Interested environment variable.
 * @param array Default array. If not set, is `[]`.
 */
function envOrArray(
	environment: string | undefined,
	array?: string[]
): string[] {
	return (environment
		? environment.includes('\n')
			? environment.split('\n')
			: environment.split(',')
		: array ?? []
	).map((s) => s.trim());
}

/**
 * Returns environment variable, given boolean, or default boolean.
 *
 * @param environment Interested environment variable.
 * @param boolean Default boolean. If not set, is `true`.
 */
function envOrBoolean(
	environment: string | undefined,
	boolean?: boolean
): boolean {
	return environment ? environment === 'true' : boolean ?? true;
}

/**
 * Returns environment variable, given string, or default string.
 *
 * @param environment Interested environment variable.
 * @param string Default string. If not set, is `''`.
 */
function envOrString(environment: string | undefined, string?: string): string {
	return environment ? environment : string ?? '';
}

/**
 * Returns environment variable, given number, or default number.
 *
 * @param environment Interested environment variable.
 * @param number Default number. If not set, is `0`.
 */
function envOrNumber(environment: string | undefined, number?: number): number {
	return environment ? Number(environment) : number ?? 0;
}

/**
 * Returns environment variable, given number, or default number,
 * while handling .env input errors for a Min/Max pair.
 * .env errors handled:
 * - Min/Max swapped (Min larger than Max, Max smaller than Min)
 * - Min larger than default Max when no Max defined
 * - Max smaller than default Min when no Min defined
 *
 * @param environmentMin Min environment variable of Min/Max pair.
 * @param environmentMax Max environment variable of Min/Max pair.
 * @param number Default number. If not set, is `0`.
 */
function envOrNumberMin(
	environmentMin: string | undefined,
	environmentMax: string | undefined,
	number?: number
) {
	if (environmentMin || environmentMax) {
		if (environmentMin && environmentMax) {
			return Number(
				Number(environmentMin) < Number(environmentMax)
					? environmentMin
					: environmentMax
			);
		}

		if (environmentMax) {
			return Number(environmentMax) < (number ?? 0)
				? Number(environmentMax)
				: number ?? 0;
		}

		if (environmentMin) {
			return Number(environmentMin);
		}
	}

	return number ?? 0;
}

/**
 * Returns environment variable, given number, or default number,
 * while handling .env input errors for a Min/Max pair.
 * .env errors handled:
 * - Min/Max swapped (Min larger than Max, Max smaller than Min)
 * - Min larger than default Max when no Max defined
 * - Max smaller than default Min when no Min defined
 *
 * @param environmentMin Min environment variable of Min/Max pair.
 * @param environmentMax Max environment variable of Min/Max pair.
 * @param number Default number. If not set, is `0`.
 */
function envOrNumberMax(
	environmentMin: string | undefined,
	environmentMax: string | undefined,
	number?: number
) {
	if (environmentMin || environmentMax) {
		if (environmentMin && environmentMax) {
			return Number(
				Number(environmentMin) < Number(environmentMax)
					? environmentMax
					: environmentMax
			);
		}

		if (environmentMin) {
			return Number(environmentMin) > (number ?? 0)
				? Number(environmentMin)
				: number ?? 0;
		}

		if (environmentMax) {
			return Number(environmentMax);
		}
	}

	return number ?? 0;
}

const browser = {
	isHeadless: envOrBoolean(process.env.HEADLESS),
	isIncognito: envOrBoolean(process.env.INCOGNITO, false),
	isTrusted: envOrBoolean(process.env.BROWSER_TRUSTED, false),
	lowBandwidth: envOrBoolean(process.env.LOW_BANDWIDTH, false),
	maxBackoff: envOrNumberMax(
		process.env.PAGE_BACKOFF_MIN,
		process.env.PAGE_BACKOFF_MAX,
		3600000
	),
	maxSleep: envOrNumberMax(
		process.env.PAGE_SLEEP_MIN,
		process.env.PAGE_SLEEP_MAX,
		10000
	),
	minBackoff: envOrNumberMin(
		process.env.PAGE_BACKOFF_MIN,
		process.env.PAGE_BACKOFF_MAX,
		10000
	),
	minSleep: envOrNumberMin(
		process.env.PAGE_SLEEP_MIN,
		process.env.PAGE_SLEEP_MAX,
		5000
	),
	open: envOrBoolean(process.env.OPEN_BROWSER)
};

const docker = envOrBoolean(process.env.DOCKER);

const logLevel = envOrString(process.env.LOG_LEVEL, 'info');

const nvidia = {
	addToCardAttempts: envOrNumber(process.env.NVIDIA_ADD_TO_CART_ATTEMPTS, 10),
	sessionTtl: envOrNumber(process.env.NVIDIA_SESSION_TTL, 60000)
};

const page = {
	height: 1080,
	inStockWaitTime: envOrNumber(process.env.IN_STOCK_WAIT_TIME),
	screenshot: envOrBoolean(process.env.SCREENSHOT),
	timeout: envOrNumber(process.env.PAGE_TIMEOUT, 30000),
	userAgents: envOrArray(process.env.USER_AGENT, [
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
	]),
	width: 1920
};

const proxy = {
	address: envOrString(process.env.PROXY_ADDRESS),
	port: envOrNumber(process.env.PROXY_PORT, 80),
	protocol: envOrString(process.env.PROXY_PROTOCOL, 'http')
};

// Check for deprecated configuration values
if (process.env.MAX_PRICE) {
	console.warn(
		'ℹ MAX_PRICE is deprecated, please use MAX_PRICE_SERIES_{{series}}'
	);
}

const store = {
	autoAddToCart: envOrBoolean(process.env.AUTO_ADD_TO_CART, true),
	country: envOrString(process.env.COUNTRY, 'usa'),
	maxPrice: {
		series: {
			3060: envOrNumber(process.env.MAX_PRICE_SERIES_3060),
			3070: envOrNumber(process.env.MAX_PRICE_SERIES_3070),
			3080: envOrNumber(process.env.MAX_PRICE_SERIES_3080),
			3090: envOrNumber(process.env.MAX_PRICE_SERIES_3090),
			rx6800: envOrNumber(process.env.MAX_PRICE_SERIES_RX6800),
			rx6800xt: envOrNumber(process.env.MAX_PRICE_SERIES_RX6800XT),
			rx6900xt: envOrNumber(process.env.MAX_PRICE_SERIES_RX6900XT),
			ryzen5600: envOrNumber(process.env.MAX_PRICE_SERIES_RYZEN5600),
			ryzen5800: envOrNumber(process.env.MAX_PRICE_SERIES_RYZEN5800),
			ryzen5900: envOrNumber(process.env.MAX_PRICE_SERIES_RYZEN5900),
			ryzen5950: envOrNumber(process.env.MAX_PRICE_SERIES_RYZEN5950),
			sf: envOrNumber(process.env.MAX_PRICE_SERIES_CORSAIR_SF),
			sonyps5c: envOrNumber(process.env.MAX_PRICE_SERIES_SONYPS5C),
			sonyps5de: envOrNumber(process.env.MAX_PRICE_SERIES_SONYPS5DE),
			'test:series': -1,
			xboxss: -1,
			xboxsx: -1
		}
	},
	microCenterLocation: envOrArray(process.env.MICROCENTER_LOCATION, ['web']),
	showOnlyBrands: envOrArray(process.env.SHOW_ONLY_BRANDS),
	showOnlyModels: envOrArray(process.env.SHOW_ONLY_MODELS).map((entry) => {
		const [name, series] = entry.match(/[^:]+/g) ?? [];
		return {
			name: envOrString(name),
			series: envOrString(series)
		};
	}),
	showOnlySeries: envOrArray(process.env.SHOW_ONLY_SERIES, [
		'3060',
		'3070',
		'3080',
		'3090',
		'rx6800',
		'rx6800xt',
		'rx6900xt',
		'ryzen5600',
		'ryzen5800',
		'ryzen5900',
		'ryzen5950',
		'sonyps5c',
		'sonyps5de',
		'xboxss',
		'xboxsx'
	]),
	stores: envOrArray(process.env.STORES, ['nvidia']).map((entry) => {
		const [name, minPageSleep, maxPageSleep] = entry.match(/[^:]+/g) ?? [];
		return {
			maxPageSleep: envOrNumberMax(
				minPageSleep,
				maxPageSleep,
				browser.maxSleep
			),
			minPageSleep: envOrNumberMin(
				minPageSleep,
				maxPageSleep,
				browser.minSleep
			),
			name: envOrString(name)
		};
	})
};

export const defaultStoreData = {
	maxPageSleep: browser.maxSleep,
	minPageSleep: browser.minSleep
};

export const config = {
	browser,
	docker,
	logLevel,
	nvidia,
	page,
	proxy,
	store
};
