import winston from 'winston';
import isError from 'lodash/isError';
import isString from 'lodash/isString';

export class Logger {

  _logFilePath: string;
  _winston: winston.Logger;

  constructor(logFilePath: string, dev = false) {
    this._logFilePath = logFilePath;
    const transports: any[] = [
      new winston.transports.File({
        filename: this._logFilePath,
        maxsize: 4 * 1024000,
        maxFiles: 5,
      }),
    ];
    if(dev)
      transports.push(new winston.transports.Console());
    this._winston = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple(),
      ),
      transports,
    });
  }

  info(message: string): void {
    this._winston.info(message);
  }

  error(err: string|Error): void {
    if(isError(err)) {
      this._winston.error(`${err.message}\n${err.stack}`);
    } else if(isString(err)) {
      this._winston.error(err);
    } else {
      console.error(err);
    }
  }

}
