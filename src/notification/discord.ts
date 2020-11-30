import {Link, Store} from '../store/model';
import {MessageBuilder, Webhook} from 'discord-webhook-node';
import {configs} from '../config';
import {logger} from '../logger';

const discord = configs.notification?.discord;

export function sendDiscordMessage(link: Link, store: Store) {
	if (discord) {
		logger.debug('↗ sending discord message');

		(async () => {
			try {
				const embed = new MessageBuilder();
				embed.setTitle('Stock Notification');
				if (link.cartUrl)
					embed.addField('Add To Cart Link', link.cartUrl, true);
				embed.addField('Product Page', link.url, true);
				embed.addField('Store', store.name, true);
				embed.addField('Brand', link.brand, true);
				embed.addField('Series', link.series, true);
				embed.addField('Model', link.model, true);

				embed.setColor(0x76b900);
				embed.setTimestamp();

				const promises = [];
				for (const entry of discord) {
					embed.setText(entry.roles.join(' '));
					promises.push(new Webhook(entry.hook).send(embed));
				}

				await Promise.all(promises);

				logger.info('✔ discord message sent');
			} catch (error: unknown) {
				logger.error("✖ couldn't send discord message", error);
			}
		})();
	}
}
