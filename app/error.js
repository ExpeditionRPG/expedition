
var global_errors = [];

export function pushError(err) {
  global_errors.push(err);
}

export function pushHTTPError(err) {
  global_errors.push(new Error(err.statusText + " (" + err.status + "): " + err.responseText));
}

export function consumeErrors() {
  var errs = global_errors;
  global_errors = [];
  return errs;
}