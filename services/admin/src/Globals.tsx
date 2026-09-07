declare let device: any;
declare let ga: any;
declare let gapi: any;

// A Document that tests can substitute. The addEventListener /
// dispatchEvent members that used to be redeclared here narrowed the DOM
// signatures incompatibly (every listener was assumed to take a MouseEvent),
// which lib.dom no longer permits; the inherited overloads are strictly
// better.
export interface ReactDocument extends Document {}

export interface ReactWindow extends Window {
  Promise?: any;
}
declare let window: ReactWindow;

const refs = {
  device: typeof device !== 'undefined' ? device : { platform: null },
  document,
  ga: typeof ga !== 'undefined' ? ga : null,
  gapi: typeof gapi !== 'undefined' ? gapi : null,
  localStorage: null as Storage | null,
  navigator: typeof navigator !== 'undefined' ? navigator : null,
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
