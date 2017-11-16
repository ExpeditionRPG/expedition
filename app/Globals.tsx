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
  AudioContext?: AudioContext;
  webkitAudioContext?: AudioContext;
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
  localStorage: { // only enable if supported by browser settings, see enableLocalStorage()
    clear: () => { return null },
    getItem: (s: string) => { return null },
    setItem: () => { return null },
    removeItem: () => { return null },
    key: null,
    length: 0,
  } as Storage,
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

// Value can be boolean, number, string or stringifiable JSON
export function setStorageKeyValue(key: string, value: any) {
  try {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    } else {
      value = value.toString();
    }
    getWindow().localStorage.setItem(key, value);
  } catch (err) {
    console.error('Error setting storage key', key, 'to', value, err);
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

// Can't set it by default, since some browsers on high privacy throw an error when accessing window.localStorage
export function enableLocalStorage(): void {
  refs.localStorage = getWindow().localStorage;
}

// Force specifying a default, since just doing (|| fallback) would bork on stored falsey values
export function getStorageBoolean(key: string, fallback: boolean): boolean {
  const val = refs.localStorage.getItem(key);
  return (val !== null) ? (val.toLowerCase() === 'true') : fallback;
}

export function getStorageJson(key: string, fallback?: object): object {
  const val = refs.localStorage.getItem(key);
  return (val !== null) ? JSON.parse(val) : fallback;
}

export function getStorageNumber(key: string, fallback?: number): number {
  const val = refs.localStorage.getItem(key);
  return (val !== null) ? Number(val) : fallback;
}

export function getStorageString(key: string, fallback?: string): string {
  const val = refs.localStorage.getItem(key);
  return (val !== null) ? val : fallback;
}
