import playerLib, {PlaySound} from 'play-sound';
import {configs} from '../config';
import fs from 'fs';
import {logger} from '../logger';

let player: PlaySound;
const sound = configs.notification?.sound;

export function playSound() {
	if (sound) {
		player = sound.player
			? playerLib({players: [sound.player]})
			: playerLib();

		if (player.player === null) {
			logger.warn("✖ couldn't find sound player");
			return;
		}

		const playerName = player.player;
		logger.info(`✔ sound player found: ${playerName}`);

		logger.debug('↗ playing sound');

		fs.access(sound.filename, fs.constants.F_OK, (error) => {
			if (error) {
				logger.error(`✖ error opening sound file: ${error.message}`);
				return;
			}

			player.play(sound.filename, (error: Error) => {
				if (error) {
					logger.error("✖ couldn't play sound", error);
				}

				logger.info('✔ played sound');
			});
		});
	}
}
