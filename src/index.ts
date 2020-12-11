import {configs} from './config'; // Needs to be loaded first
import {Browser} from 'puppeteer'; // eslint-disable-line sort-imports
import {getSleepTime} from './util';
import {logger} from './logger';
import puppeteer from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import {storeList} from './store/model';
import {tryLookupAndLoop} from './store';

puppeteer.use(stealthPlugin());

let browser: Browser | undefined;

/**
 * Starts the bot.
 */
async function main() {
	const args: string[] = [];

	// Skip Chromium Linux Sandbox
	// https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
	if (configs.browser.trusted) {
		args.push('--no-sandbox');
		args.push('--disable-setuid-sandbox');
	}

	// https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#tips
	// https://stackoverflow.com/questions/48230901/docker-alpine-with-node-js-and-chromium-headless-puppeter-failed-to-launch-c
	if (configs.docker) {
		args.push('--disable-dev-shm-usage');
		args.push('--no-sandbox');
		args.push('--disable-setuid-sandbox');
		args.push('--headless');
		args.push('--disable-gpu');
	}

	// Add the address of the proxy server if defined
	if (configs.proxy?.address) {
		args.push(
			`--proxy-server=${configs.proxy.protocol}://${configs.proxy.address}:${configs.proxy.port}`
		);
	}

	if (args.length > 0) {
		logger.info('ℹ puppeteer config: ', args);
	}

	await stop();
	browser = await puppeteer.launch({
		args,
		defaultViewport: {
			height: configs.browser.page.height,
			width: configs.browser.page.width
		},
		headless: configs.browser.headless
	});

	for (const store of storeList.values()) {
		logger.debug('store links', {meta: {links: store.links}});
		if (store.setupAction !== undefined) {
			store.setupAction(browser);
		}

		setTimeout(tryLookupAndLoop, getSleepTime(store), browser, store);
	}
}

async function stop() {
	if (browser) {
		// Use temporary swap variable to avoid any race condition
		const browserTemporary = browser;
		browser = undefined;
		await browserTemporary.close();
	}
}

async function stopAndExit() {
	await stop();
	// eslint-disable-next-line unicorn/no-process-exit
	process.exit(0);
}

/**
 * Will continually run until user interferes.
 */
async function loopMain() {
	try {
		await main();
	} catch (error: unknown) {
		logger.error(
			'✖ something bad happened, resetting streetmerchant in 5 seconds',
			error
		);
		setTimeout(loopMain, 5000);
	}
}

void loopMain();

process.on('SIGINT', stopAndExit);
process.on('SIGQUIT', stopAndExit);
process.on('SIGTERM', stopAndExit);
