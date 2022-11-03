import express from 'express';
import { SessionTracker } from './session-tracker';

export class SessionServer {

  static defaultPort = 34418;

  _port: number;
  _sessionTracker: SessionTracker;
  _logInfo: (message: string) => void;
  _logError: (err: string|Error) => void;

  constructor(port: number, sessionTracker: SessionTracker, logInfo: (message: string) => void, logError: (err: string|Error) => void) {
    this._port = port;
    this._sessionTracker = sessionTracker;
    this._logInfo = logInfo;
    this._logError = logError;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._logInfo('Starting session server');
      express()
        .get('/node/:id', (req: express.Request, res: express.Response) => {
          try {
            const status = this._sessionTracker.getStatus(req.params.id);
            res.type('application/json');
            res.send(status);
          } catch(err) {
            this._logError(err);
            res.status(500);
            res.send(err.message);
          }
        })
        .listen(this._port, () => {
          this._logInfo(`Session server listening at port ${this._port}`);
          resolve();
        })
        .on('error', err => {
          reject(err);
        });
    });
  }

}
