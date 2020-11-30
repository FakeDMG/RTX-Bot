import {Link, Store} from '../store/model';
import {Print, logger} from '../logger';
import {Twilio} from 'twilio';
import {configs} from '../config';

const twilio = configs.notification?.twilio;

export function sendTwilioMessage(link: Link, store: Store) {
	if (twilio) {
		logger.debug('↗ sending twilio message');

		const client = new Twilio(twilio.accountId, twilio.token);

		(async () => {
			const givenUrl = link.cartUrl ? link.cartUrl : link.url;
			const message = `${Print.inStock(link, store)}\n${givenUrl}`;

			try {
				await client.messages.create({
					body: message,
					from: twilio.from,
					to: twilio.to
				});
				logger.info('✔ twilio message sent');
			} catch (error: unknown) {
				logger.error("✖ couldn't send twilio message", error);
			}
		})();
	}
}
