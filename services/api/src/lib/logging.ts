import Config from '../config';

const winston: any = require('winston');
const expressWinston: any = require('express-winston');

const colorize = (Config.get('NODE_ENV') !== 'production');

// Logger to capture all requests and output them to the console.
const requestLogger = expressWinston.logger({
  expressFormat: true,
  meta: false,
  transports: [
    new winston.transports.Console({
      colorize,
      json: false,
    }),
  ],
});

// Logger to capture any top-level errors and output json diagnostic info.
const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      colorize,
      json: true,
    }),
  ],
});

export default {
  debug: winston.debug,
  error: winston.error,
  errorLogger,
  info: winston.info,
  log: winston.log,
  requestLogger,
  silly: winston.silly,
  verbose: winston.verbose,
  warn: winston.warn,
};
