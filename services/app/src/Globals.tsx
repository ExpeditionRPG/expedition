import * as cheerio from 'shared/Cheerio';
import { API_HOST } from 'shared/schema/Constants';

declare let device: any;
declare let ga: any;
declare let google: any;

// A Document that tests can substitute. The addEventListener /
// dispatchEvent members that used to be redeclared here narrowed the DOM
// signatures incompatibly (every listener was assumed to take a MouseEvent),
// which lib.dom no longer permits; the inherited overloads are strictly
// better.
export interface ReactDocument extends Document {}

export interface CordovaLoginPlugin {
  trySilentLogin: (
    options: { scopes: string; webClientId: string },
    success: (obj: any) => any,
    error: (err: string) => any,
  ) => void;
  login: (
    options: { scopes: string; webClientId: string },
    success: (obj: any) => any,
    error: (err: string) => any,
  ) => void;
}

export interface ReactWindow extends Window {
  platform?: string;
  VERSION?: string;
  AndroidFullScreen?: {
    immersiveMode: (success: () => any, failure: () => any) => void;
  };
  AudioContext?: AudioContext;
  webkitAudioContext?: AudioContext;
  cordova?: {
    InAppBrowser?: {
      open?: any;
    };
  };
  plugins?: {
    insomnia?: { keepAwake: () => void };
    googleplus?: CordovaLoginPlugin;
  };
  Promise?: any;
  test?: boolean;
  device?: { platform: string };
}
declare let window: ReactWindow;

const refs = {
  cheerio,
  device: typeof device !== 'undefined' ? device : { platform: null },
  document,
  ga: typeof ga !== 'undefined' ? ga : null,
  google: typeof google !== 'undefined' ? google : null,
  history: typeof history !== 'undefined' ? history : { pushState: () => null },
  localStorage: null as Storage | null,
  navigator: typeof navigator !== 'undefined' ? navigator : null,
  window,
  audioContext: null,
};

export function getDevicePlatform(): 'android' | 'ios' | 'web' {
  const p = (getDevice() || {}).platform;
  const platform = (p || window.navigator.appVersion || '').toLowerCase();
  if (!window.cordova) {
    return 'web';
  } else if (/android/.test(platform)) {
    return 'android';
  } else if (/iphone|ipad|ipod|ios/.test(platform)) {
    return 'ios';
  }
  return 'web';
}

export function getPlatformDump(): string {
  return (
    (window.navigator.platform || '') +
    ': ' +
    (window.navigator.userAgent || '') +
    ': ' +
    (window.navigator.cookieEnabled ? 'W/COOKIES' : 'NO COOKIES')
  );
}

export function setWindow(w: ReactWindow) {
  refs.window = w;
}

export function setDocument(d: ReactDocument) {
  refs.document = d;
}

export function setDeviceForTest(d: any) {
  window.cordova = window.cordova || (true as any);
  refs.device = d;
}

export function setGA(g: any) {
  refs.ga = g;
}

export function setNavigator(n: any) {
  refs.navigator = n;
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

export function getGA(): any {
  return refs.ga;
}

export function getGoogle(): any {
  return refs.google;
}

export function getHistoryApi(): any {
  return refs.history;
}

export function getNavigator(): any {
  return refs.navigator;
}

// The repo's cheerio wrapper (shared/Cheerio), reached through the same ref
// table as the other ambient dependencies. `CheerioAPI` used to name the module
// here; in cheerio 1.x that name means the document-bound `$`, so this is typed
// as the module itself.
export function getCheerio(): typeof cheerio {
  return refs.cheerio;
}

export function getAudioContext(): AudioContext | null {
  if (refs.audioContext) {
    return refs.audioContext;
  }
  try {
    refs.audioContext = new ((getWindow().AudioContext as any) ||
      (getWindow().webkitAudioContext as any))();
  } catch (err) {
    console.log('Web Audio API is not supported in this browser');
    refs.audioContext = null;
  }
  return refs.audioContext;
}

// https://github.com/github/fetch/issues/175#issuecomment-216791333
function timeoutPromise<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('promise timeout'));
    }, ms);
    promise.then(
      res => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      err => {
        clearTimeout(timeoutId);
        reject(err);
      },
    );
  });
}

export function getOnlineState(): Promise<boolean> {
  return timeoutPromise(500, fetch(API_HOST + '/healthcheck'))
    .then(() => true)
    .catch(() => false);
}

export function openWindow(url: string): any {
  const platform = getDevicePlatform();
  // Android is special; iOS and web use the same
  if (platform === 'android' && getNavigator().app) {
    getNavigator().app.loadUrl(url, { openExternal: true });
  } else {
    const open =
      ((window.cordova || {}).InAppBrowser || {}).open || window.open;
    open(url, '_system');
  }
}

// Can't set it by default, since some browsers on high privacy throw an error when accessing window.localStorage
export function getLocalStorage(): Storage {
  if (refs.localStorage) {
    return refs.localStorage;
  }

  // Alert user if cookies disabled (after error display set up)
  // Based on https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cookies.js
  try {
    const d = getDocument();
    d.cookie = 'cookietest=1';
    const ret = d.cookie.indexOf('cookietest=') !== -1;
    d.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
    if (!ret) {
      throw new Error('Cookies disabled');
    }
    refs.localStorage = getWindow().localStorage;
  } catch (err) {
    console.error(err);
  } finally {
    if (!refs.localStorage) {
      refs.localStorage = {
        clear: () => null,
        getItem: (s: string) => null,
        key: (index: number | string) => null,
        length: 0,
        removeItem: () => null,
        setItem: () => null,
      };
    }
    return refs.localStorage;
  }
}
