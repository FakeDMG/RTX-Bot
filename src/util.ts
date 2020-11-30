import {StatusCodeRangeArray, Store} from './store/model';
import {Page} from 'puppeteer';
import {configs} from './config';
import {disableBlockerInPage} from './adblocker';

export function getSleepTime(store: Store) {
	const minSleep = store.minPageSleep as number;
	return minSleep + Math.random() * ((store.maxPageSleep as number) - minSleep);
}

export async function delay(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
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
	if (!configs.browser.lowBandwidth) {
		await disableBlockerInPage(page);
	}

	await page.close();
}

export function getRandomUserAgent(): string {
	if (configs.browser.userAgents) {
		return configs.browser.userAgents[
			Math.floor(Math.random() * configs.browser.userAgents.length)
		];
	}

	return '';
}
