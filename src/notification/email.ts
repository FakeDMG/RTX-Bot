import {Link, Store} from '../store/model';
import {Print, logger} from '../logger';
import Mail from 'nodemailer/lib/mailer';
import {configs} from '../config';
import {createTransporter} from './util';

const email = configs.notification?.email;

export function sendEmail(link: Link, store: Store) {
	if (email) {
		logger.debug('↗ sending email');

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
			subject: Print.inStock(link, store),
			text: Print.productInStock(link),
			to: email.to
		};

		const transporter = createTransporter();

		transporter.sendMail(mailOptions, (error) => {
			if (error) {
				logger.error("✖ couldn't send email", error);
			} else {
				logger.info('✔ email sent');
			}
		});
	}
}
