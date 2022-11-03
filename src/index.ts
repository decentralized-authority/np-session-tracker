import fs from 'fs-extra';
import { Logger } from './logger';
import { IS_DEV, LOG_DIR_PATH, LOG_FILE_PATH, NP_API_ENDPOINT, POCKET_ENDPOINT, ROOT_DIR_PATH } from './constants';
import { Configuration, HttpRpcProvider, Pocket } from '@pokt-network/pocket-js';
import { SessionTracker } from './session-tracker';
import { NPAPI } from './np-api';
import request from 'superagent';
import path from 'path';
import { SessionServer } from './session-server';

fs.ensureDirSync(ROOT_DIR_PATH);
fs.ensureDirSync(LOG_DIR_PATH);

const logger = new Logger(
  LOG_FILE_PATH,
  IS_DEV,
);

const handleStartupError = (err: string|Error): void => {
  if(!IS_DEV)
    console.error(err);
  logger.error(err);
  setTimeout(() => {
    process.exit(1);
  }, 1000);
};

try {

  const { version } = fs.readJsonSync(path.resolve(__dirname, '../package.json'), 'utf8');

  logger.info(`Starting Node Pilot Session Tracker v${version}`);

  if(!POCKET_ENDPOINT)
    throw 'POCKET_ENDPOINT environment variable is not set.';
  if(!NP_API_ENDPOINT)
    throw 'NP_API_ENDPOINT environment variable is not set.';

  const dispatcher = new URL(POCKET_ENDPOINT);
  const configuration = new Configuration(5, 1000, 0, 40000, undefined, undefined, undefined, undefined, undefined, undefined, false);
  const pocket = new Pocket([dispatcher], new HttpRpcProvider(dispatcher), configuration);

  const np = new NPAPI(NP_API_ENDPOINT, request);

  const sessionTracker = new SessionTracker(
    np,
    pocket,
    message => logger.info(message),
    err => logger.error(err),
  );

  sessionTracker.start()
    .catch(err => {
      handleStartupError(err);
    });

  const { SESSION_TRACKER_PORT: sessionTrackerPort } = process.env;

  const server = new SessionServer(
    sessionTrackerPort ? Number(sessionTrackerPort) : SessionServer.defaultPort,
    sessionTracker,
    message => logger.info(message),
    err => logger.error(err),
  );

  server.start()
    .catch(err => {
      handleStartupError(err);
    });

} catch(err) {
  handleStartupError(err);
}
