declare var cordova: any;
declare var device: any;
declare var ga: any;
declare var gapi: any;

const PACKAGE = require('../package.json');

export function getAppVersion(): string {
  return PACKAGE.version;
}

export interface ReactDocument extends Document {
  addEventListener: (e: string, f: (this: any, ev: MouseEvent) => any,
                     useCapture?: boolean) => void;
  dispatchEvent: (e: Event) => boolean;
}

export interface CordovaLoginPlugin {
  trySilentLogin: (options: {scopes: string, webClientId: string},
                   success: (obj: any) => any, error: (err: string) => any) => void;
  login: (options: {scopes: string, webClientId: string},
          success: (obj: any) => any, error: (err: string) => any) => void;
}

export interface ReactWindow extends Window {
  platform?: string;
  APP_VERSION?: string;
  AndroidFullScreen?: {
    immersiveMode: (success: () => any, failure: () => any) => void,
  };
  AudioContext?: AudioContext;
  webkitAudioContext?: AudioContext;
  cordova?: {
    InAppBrowser?: {
      open?: any;
    }
  };
  plugins?: {
    insomnia?: {keepAwake: () => void},
    googleplus?: CordovaLoginPlugin,
  };
  Promise?: any;
  test?: boolean;
  device?: {platform: string};
}
declare var window: ReactWindow;

const refs = {
  cheerio: require('cheerio') as CheerioAPI,
  device: (typeof device !== 'undefined') ? device : {platform: null},
  document,
  ga: (typeof ga !== 'undefined') ? ga : null,
  gapi: (typeof gapi !== 'undefined') ? gapi : null,
  history: (typeof history !== 'undefined') ? history : {pushState: () => null},
  localStorage: null as (Storage|null),
  navigator: (typeof navigator !== 'undefined') ? navigator : null,
  window,
};

export function getDevicePlatform(): 'android' | 'ios' | 'web' {
  const device = getDevice();

  if (!device) {
    return 'web';
  }

  const p = (device.platform || window.navigator.appVersion || '').toLowerCase();
  if (/android/.test(p)) {
    return 'android';
  } else if (/iphone|ipad|ipod|ios/.test(p)) {
    return 'ios';
  } else {
    return 'web';
  }
}

export function getPlatformDump(): string {
  return (window.navigator.platform || '') + ': ' + (window.navigator.userAgent || '') + ': ' + (window.navigator.cookieEnabled ? 'W/COOKIES' : 'NO COOKIES');
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

export function setGA(ga: any) {
  refs.ga = ga;
}

export function setNavigator(navigator: any) {
  refs.navigator = navigator;
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

export function getGapi(): any {
  return refs.gapi;
}

export function getHistoryApi(): any {
  return refs.history;
}

export function getNavigator(): any {
  return refs.navigator;
}

export function getCheerio(): CheerioAPI {
  return refs.cheerio;
}

export function openWindow(url: string): any {
  const platform = getDevicePlatform();
  // Android is special; iOS and web use the same
  if (platform === 'android' && getNavigator().app) {
    getNavigator().app.loadUrl(url, { openExternal: true });
  } else {
    const open = ((window.cordova || {}).InAppBrowser || {}).open || window.open;
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
        setItem: () => null,
        removeItem: () => null,
        key: (index: number|string) => null,
        length: 0,
      } as Storage;
    }
    return refs.localStorage;
  }
}
