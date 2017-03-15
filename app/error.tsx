export interface ErrorType {
  name?: string;
  message?: string;
  line?: string;
  statusText?: string;
  status?: string;
  responseText?: string;
  stack?: string;
  usage?: string;
}

var global_errors: ErrorType[] = [];

export function pushError(err: Error): void {
  global_errors.push(err);
}

export function pushHTTPError(err: ErrorType): void {
  global_errors.push(new Error(err.statusText + ' (' + err.status + '): ' + err.responseText));
}

export function consumeErrors(): ErrorType[] {
  var errs = global_errors;
  global_errors = [];
  return errs;
}
