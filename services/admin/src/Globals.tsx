declare var device: any;
declare var ga: any;
declare var gapi: any;

const PACKAGE = require('../package.json');

export interface ReactDocument extends Document {
  addEventListener: (e: string, f: (this: any, ev: MouseEvent) => any, useCapture?: boolean) => void;
  dispatchEvent: (e: Event) => boolean;
}

export interface ReactWindow extends Window {
  FirebasePlugin?: {
    onTokenRefresh: (success: (token: string) => any, failure: (error: string) => any) => void,
    logEvent: (name: string, args: any) => any,
  };
  Promise?: any;
}
declare var window: ReactWindow;

const refs = {
  device: (typeof device !== 'undefined') ? device : {platform: null},
  document,
  ga: (typeof ga !== 'undefined') ? ga : null,
  gapi: (typeof gapi !== 'undefined') ? gapi : null,
  localStorage: null as (Storage|null),
  navigator: (typeof navigator !== 'undefined') ? navigator : null,
  window,
};

export function setWindow(w: ReactWindow) {
  refs.window = w;
}

export function setDocument(d: ReactDocument) {
  refs.document = d;
}

export function setGA(g: any) {
  refs.ga = g;
}

export function getWindow(): ReactWindow {
  return refs.window;
}

export function getDocument(): Document {
  return refs.document;
}

export function getGA(): any {
  return refs.ga;
}

export function getGapi(): any {
  return refs.gapi;
}

export function getAppVersion(): string {
  return PACKAGE.version;
}
