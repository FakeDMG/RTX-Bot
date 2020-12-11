import {Link, Store} from '../store/model';
import {Print, logger} from '../logger';
import {WebClient} from '@slack/web-api';
import {config} from '../config';

const slack = config.notification?.slack;

export function sendSlackMessage(link: Link, store: Store) {
	if (slack) {
		logger.debug('↗ sending slack message');

		for (const entry of slack) {
			const web = new WebClient(entry.token);

			(async () => {
				const givenUrl = link.cartUrl ? link.cartUrl : link.url;

				try {
					const promises = [];

					for (const channel of entry.channels) {
						promises.push(
							web.chat.postMessage({
								channel,
								text: `${Print.inStock(
									link,
									store
								)}\n${givenUrl}`
							})
						);
					}

					const results = await Promise.all(promises);

					results.forEach((result) => {
						if (result.ok) {
							logger.info('✔ slack message sent');
						} else {
							logger.error(
								"✖ couldn't send slack message",
								result
							);
						}
					});
				} catch (error: unknown) {
					logger.error("✖ couldn't send slack message", error);
				}
			})();
		}
	}
}
