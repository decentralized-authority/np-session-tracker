import path from 'path';

export const IS_DEV = process.env.NODE_ENV !== 'production';

export const ROOT_DIR_PATH = process.env.NP_SESSION_TRACKER_HOME || path.join(process.env.HOME || process.env.HOMEPATH || '.', 'np-session-tracker');
export const LOG_DIR_PATH = path.join(ROOT_DIR_PATH, 'log');
export const LOG_FILE_PATH = path.join(LOG_DIR_PATH, 'session-tracker.log');
