import path from 'path';

export const POCKET_ENDPOINT = process.env.POCKET_ENDPOINT || '';
export const POCKET_HEIGHT_ENDPOINT = process.env.POCKET_HEIGHT_ENDPOINT || '';
export const NP_API_ENDPOINT = process.env.NP_API_ENDPOINT || '';

export const IS_DEV = process.env.NODE_ENV !== 'production';

export const ROOT_DIR_PATH = process.env.NP_SESSION_TRACKER_HOME || path.join(process.env.HOME || process.env.HOMEPATH || '.', 'np-session-tracker');
export const LOG_DIR_PATH = path.join(ROOT_DIR_PATH, 'log');
export const LOG_FILE_PATH = path.join(LOG_DIR_PATH, 'session-tracker.log');

export const REQUEST_TIMEOUT = 10000;
