import {Link, Store} from '../store/model';
import {Print, logger} from '../logger';
import Push, {PushoverMessage} from 'pushover-notifications';
import {configs} from '../config';

const pushover = configs.notification?.pushover;

export function sendPushoverNotification(link: Link, store: Store) {
	if (pushover) {
		logger.debug('↗ sending pushover message');

		const message: PushoverMessage =
			pushover.priority < 2
				? {
						message: link.cartUrl ? link.cartUrl : link.url,
						priority: pushover.priority,
						title: Print.inStock(link, store)
				  }
				: {
						expire: pushover.expire,
						message: link.cartUrl ? link.cartUrl : link.url,
						priority: pushover.priority,
						retry: pushover.retry,
						title: Print.inStock(link, store)
				  };

		new Push({
			token: pushover.token,
			user: pushover.username
		}).send(message, (error: Error) => {
			if (error) {
				logger.error("✖ couldn't send pushover message", error);
			} else {
				logger.info('✔ pushover message sent');
			}
		});
	}
}
