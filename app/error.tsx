
export type HTTPErrorType = {statusText: string, status: string, responseText: string};

var global_errors: (Error|HTTPErrorType)[] = [];

export function pushError(err: Error): void {
  global_errors.push(err);
}

export function pushHTTPError(err: HTTPErrorType): void {
  global_errors.push(new Error(err.statusText + " (" + err.status + "): " + err.responseText));
}

export function consumeErrors(): (Error|HTTPErrorType)[] {
  var errs = global_errors;
  global_errors = [];
  return errs;
}