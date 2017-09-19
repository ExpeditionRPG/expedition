declare var device: any;
declare var gapi: any;
declare var ga: any;

const PACKAGE = require('../package.json');
import 'whatwg-fetch' // fetch polyfill
import Promise from 'promise-polyfill' // promise polyfill


export interface ReactDocument extends Document {
  addEventListener: (e: string, f: (this: any, ev: MouseEvent) => any, useCapture?: boolean) => void;
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
  Promise?: any;
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
  navigator: (typeof navigator !== 'undefined') ? navigator : null,
};

export function setupPolyfills(): void {
  if (!window.Promise) {
    window.Promise = Promise;
  }
}

export function getAppVersion(): string {
  return PACKAGE.version;
}

export function getDevicePlatform(): 'android' | 'ios' | 'web' {
  const device = getDevice();

  if (device === undefined) {
    return 'web';
  }

  const p = (device.platform || '').toLowerCase();
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

export function setNavigator(navigator: any) {
  refs.navigator = navigator;
}

export function setStorageKey(key: string, value: any) {
  try {
    getWindow().localStorage.setItem(key, value.toString());
  } catch (e) {
    console.log('Error setting storage key', key, 'to', value, e);
  }
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

export function getNavigator(): any {
  return refs.navigator;
}

// Force specifying a default, since just doing (|| fallback) would bork on stored falsey values
export function getStorageKeyBoolean(key: string, fallback: boolean): boolean {
  const val = getWindow().localStorage.getItem(key);
  return (val !== null) ? (val.toLowerCase() === 'true') : fallback;
}

export function getStorageKeyNumber(key: string, fallback?: number): number {
  const val = getWindow().localStorage.getItem(key);
  return (val !== null) ? Number(val) : fallback;
}

export function getStorageKeyString(key: string, fallback?: string): string {
  const val = getWindow().localStorage.getItem(key);
  return (val !== null) ? val : fallback;
}
