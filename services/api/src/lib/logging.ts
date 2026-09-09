import * as expressWinston from 'express-winston';
import * as winston from 'winston';
import Config from '../config';

const colorize = Config.get('NODE_ENV') !== 'production';

// winston 3 deleted the `colorize` / `json` / `prettyPrint` / `timestamp`
// *transport* options -- output shape is now a composable `format`. The two
// formats below reproduce, byte for byte, what winston 2 printed on Heroku, so
// that anything scraping these logs keeps working:
//
//   requestFormat  ->  `info: GET /healthcheck 200 3ms`   (was `json: false`)
//   errorFormat    ->  a 2-space-indented JSON object     (was `json: true`)
//
// `winston.format.simple()` is the v3 spelling of v2's non-json console output
// (`<level>: <message>`, plus a trailing JSON blob only when there is extra
// meta -- the request logger passes `meta: false`, so there never is).
const requestFormat = colorize
  ? winston.format.combine(winston.format.colorize(), winston.format.simple())
  : winston.format.simple();

// v2 stringified with JSON.stringify, which preserves insertion order; v3 uses
// safe-stable-stringify, which alphabetises keys unless told not to. Insertion
// order is what puts express-winston's exception fields (date, process, os,
// trace, stack, req) ahead of `level` and `message`, so keep it.
// `colorize` is deliberately not applied here: v2 ignored it whenever
// `json: true` was set, and the captured v2 output has no escape codes.
const errorFormat = winston.format.json({ deterministic: false, space: 2 });

const consoleTransport = () => new winston.transports.Console();

// Exported so tests can attach a second transport and assert on the exact line
// that gets written. The format lives on the logger rather than on the Console
// transport precisely so that any added transport sees the identical string.
export const requestLoggerInstance = winston.createLogger({
  format: requestFormat,
  transports: [consoleTransport()],
});

export const errorLoggerInstance = winston.createLogger({
  format: errorFormat,
  transports: [consoleTransport()],
});

// Logger to capture all requests and output them to the console.
const requestLogger = expressWinston.logger({
  expressFormat: true,
  meta: false,
  // express-winston 4 nests meta under a `meta` key by default, and does it
  // even when `meta: false` left the meta empty -- which appends a literal
  // ` {"meta":{}}` to every request line. v2 had no such default.
  metaField: null,
  winstonInstance: requestLoggerInstance,
});

// Logger to capture any top-level errors and output json diagnostic info.
const errorLogger = expressWinston.errorLogger({
  // winston 3's ExceptionHandler.getAllInfo() adds two fields winston 2's did
  // not: the raw `error` (which JSON.stringify flattens to `{}`, since an
  // Error has no enumerable own properties) and `exception: true`. The second
  // one is not cosmetic: winston-transport's `_write` *discards* any record
  // with `exception === true` unless the transport was built with
  // `handleExceptions`, so leaving it in place silently drops every error log.
  // Opting the transport in would also install winston's own
  // process-level uncaughtException handler as a side effect (Logger.add ->
  // this.exceptions.handle()), which is a much bigger change than this file
  // should be making. Dropping both fields fixes the logging and restores
  // exactly the key set winston 2 emitted.
  blacklistedMetaFields: ['error', 'exception'],
  // express-winston 4 nests the exception meta under a `meta` key by default;
  // v2 left it at the top level of the JSON object. `null` restores that.
  metaField: null,
  winstonInstance: errorLoggerInstance,
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
