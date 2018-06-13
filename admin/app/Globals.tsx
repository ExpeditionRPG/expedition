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
  window: window,
  document: document,
  localStorage: null as (Storage|null),
  device: (typeof device !== 'undefined') ? device : {platform: null},
  ga: (typeof ga !== 'undefined') ? ga : null,
  gapi: (typeof gapi !== 'undefined') ? gapi : null,
  navigator: (typeof navigator !== 'undefined') ? navigator : null,
};

export function setWindow(win: ReactWindow) {
  refs.window = win;
}

export function setDocument(doc: ReactDocument) {
  refs.document = doc;
}

export function setGA(ga: any) {
  refs.ga = ga;
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
