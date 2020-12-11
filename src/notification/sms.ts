import {Link, Store} from '../store/model';
import {Print, logger} from '../logger';
import Mail from 'nodemailer/lib/mailer';
import {config} from '../config';
import {createTransporter} from './util';

const [email, phone] = [config.notification?.email, config.notification?.phone];

const availableCarriers = new Map([
	['att', 'txt.att.net'],
	['attgo', 'mms.att.net'],
	['bell', 'txt.bell.ca'],
	['fido', 'fido.ca'],
	['google', 'msg.fi.google.com'],
	['koodo', 'msg.koodomobile.com'],
	['mint', 'mailmymobile.net'],
	['rogers', 'pcs.rogers.com'],
	['sprint', 'messaging.sprintpcs.com'],
	['telus', 'msg.telus.com'],
	['tmobile', 'tmomail.net'],
	['verizon', 'vtext.com'],
	['virgin', 'vmobl.com'],
	['virgin-ca', 'vmobile.ca']
]);

function generateAddress(number: string, carrier: string) {
	if (carrier && availableCarriers.has(carrier)) {
		return {
			address: [number, availableCarriers.get(carrier)].join('@'),
			err: undefined
		};
	}

	return {
		address: '',
		err: `✖ ${carrier} is not an available carrier`
	};
}

export function sendSms(link: Link, store: Store) {
	if (email && phone) {
		for (const entry of phone) {
			logger.debug('↗ sending sms');

			const {address, err} = generateAddress(entry.number, entry.carrier);

			if (err) {
				logger.error(err);
				continue;
			}

			const mailOptions: Mail.Options = {
				attachments: link.screenshot
					? [
							{
								filename: link.screenshot,
								path: `./${link.screenshot}`
							}
					  ]
					: undefined,
				from: email.username,
				subject: Print.inStock(link, store, false, true),
				text: link.cartUrl ? link.cartUrl : link.url,
				to: address
			};

			const transporter = createTransporter();

			transporter.sendMail(mailOptions, (error) => {
				if (error) {
					logger.error(
						`✖ couldn't send sms to ${entry.number} for carrier ${entry.carrier}`,
						error
					);
				} else {
					logger.info('✔ sms sent');
				}
			});
		}
	}
}
