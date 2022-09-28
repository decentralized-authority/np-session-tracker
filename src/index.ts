import fs from 'fs-extra';
import { Logger } from './logger';
import { IS_DEV, LOG_DIR_PATH, LOG_FILE_PATH, ROOT_DIR_PATH } from './constants';

fs.ensureDirSync(ROOT_DIR_PATH);
fs.ensureDirSync(LOG_DIR_PATH);

const logger = new Logger(
  LOG_FILE_PATH,
  IS_DEV,
);

try {

  logger.info('Starting Node Pilot Session Tracker');

} catch(err) {
  logger.error(err);
}
