import Mail from 'nodemailer/lib/mailer';
import {config} from '../config';
import nodemailer from 'nodemailer';

const email = config.notification?.email;

export function createTransporter(): Mail {
	const transportOptions: any = {};

	if (email) {
		if (email.password) {
			transportOptions.auth = {};
			transportOptions.auth.user = email.username;
			transportOptions.auth.pass = email.password;
		}

		if (email.smtp) {
			transportOptions.host = email.smtp.address;
			transportOptions.port = email.smtp.port;
		} else {
			transportOptions.service = 'gmail';
		}
	}

	return nodemailer.createTransport({
		...transportOptions
	});
}
