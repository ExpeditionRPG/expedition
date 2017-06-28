declare var device: any;
declare var gapi: any;
declare var ga: any;

const PACKAGE = require('../package.json');

export interface ReactDocument extends Document {
  addEventListener: (e: string, f: any, useCapture?: boolean) => void;
  dispatchEvent: (e: Event) => boolean;
}

export interface ReactWindow extends Window {
  platform?: string;
  APP_VERSION?: string;
  AndroidFullScreen?: {
    immersiveMode: (success: () => any, failure: () => any) => void,
  };
  FirebasePlugin?: {
    onTokenRefresh?: (success: (token: string) => any, failure: (error: string) => any) => void,
    logEvent: (name: string, args: any) => any,
  };
  plugins?: {
    insomnia: {keepAwake: ()=>void},
  };
  test?: boolean;
  device?: {platform: string};
}
declare var window: ReactWindow;

const refs = {
  window: window,
  document: document,
  device: (typeof device !== 'undefined') ? device : {platform: null},
  gapi: (typeof gapi !== 'undefined') ? gapi : null,
  ga: (typeof ga !== 'undefined') ? ga : null,
};

export function getAppVersion(): string {
  return PACKAGE.version;
}

export function getDevicePlatform(): 'android' | 'ios' | 'web' {
  const device = getDevice();

  if (device === undefined) {
    return 'web';
  }

  var p = (device.platform || '').toLowerCase();
  if (/android/i.test(p)) {
    return 'android';
  } else if (/iphone|ipad|ipod|ios/i.test(p)) {
    return 'ios';
  } else {
    return 'web';
  }
}

export function setWindow(win: ReactWindow) {
  refs.window = win;
}

export function setDocument(doc: ReactDocument) {
  refs.document = doc;
}

export function setDevice(device: any) {
  refs.device = device;
}

export function setGapi(gapi: any) {
  refs.gapi = gapi;
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

export function getDevice(): any {
  return refs.device;
}

export function getGapi(): any {
  return refs.gapi;
}

export function getGA(): any {
  return refs.ga;
}
