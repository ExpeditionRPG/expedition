import Config from '../config'

const winston: any = require('winston');
const expressWinston: any = require('express-winston');

const colorize = (Config.get('NODE_ENV') !== 'production');

// Logger to capture all requests and output them to the console.
const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: false,
      colorize: colorize,
    }),
  ],
  expressFormat: true,
  meta: false,
});

// Logger to capture any top-level errors and output json diagnostic info.
const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: colorize,
    }),
  ],
});

export default {
  requestLogger: requestLogger,
  errorLogger: errorLogger,
  error: winston.error,
  warn: winston.warn,
  info: winston.info,
  log: winston.log,
  verbose: winston.verbose,
  debug: winston.debug,
  silly: winston.silly,
};
