import {StatusCodeRangeArray, Store} from './store/model';
import {Page} from 'puppeteer';
import {config} from './config';
import {disableBlockerInPage} from './adblocker';
import {getRandom} from 'random-useragent';
import {logger} from './logger';

export function getSleepTime(store: Store) {
	const minSleep = store.minPageSleep as number;
	return (
		minSleep + Math.random() * ((store.maxPageSleep as number) - minSleep)
	);
}

export async function delay(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function noop() {
	// Do nothing
}

export function isStatusCodeInRange(
	statusCode: number,
	range: StatusCodeRangeArray
) {
	for (const value of range) {
		let min: number;
		let max: number;
		if (typeof value === 'number') {
			min = value;
			max = value;
		} else {
			[min, max] = value;
		}

		if (min <= statusCode && statusCode <= max) {
			return true;
		}
	}

	return false;
}

export async function closePage(page: Page) {
	if (!config.browser.lowBandwidth) {
		await disableBlockerInPage(page);
	}

	await page.close();
}

export async function getRandomUserAgent(): Promise<string> {
	const userAgent =
		getRandom((ua) => {
			return ua.browserName === 'Chrome' && ua.browserVersion > '20';
		}) ?? '';

	logger.debug('user agent', userAgent);

	return userAgent;
}
