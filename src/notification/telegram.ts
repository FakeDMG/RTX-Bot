import {Link, Store} from '../store/model';
import {Print, logger} from '../logger';
import {TelegramClient} from 'messaging-api-telegram';
import {configs} from '../config';

const telegram = configs.notification?.telegram;

export function sendTelegramMessage(link: Link, store: Store) {
	if (telegram) {
		logger.debug('↗ sending telegram message');

		const client = new TelegramClient({
			accessToken: telegram.token
		});

		(async () => {
			const message = Print.productInStock(link);
			const results = [];

			for (const chatId of telegram.chatIds) {
				try {
					results.push(
						client.sendMessage(
							chatId,
							`${Print.inStock(link, store)}\n${message}`
						)
					);
					logger.info('✔ telegram message sent');
				} catch (error: unknown) {
					logger.error("✖ couldn't send telegram message", error);
				}
			}

			await Promise.all(results);
		})();
	}
}
