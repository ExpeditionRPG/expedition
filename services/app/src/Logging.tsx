// We need to keep imports very light here - this code used in Init.tsx
// before much of our state has been initialized.
import {getGA} from './Globals';

const START_BUFFER_MAX_LENGTH = 25;
const TAIL_BUFFER_MAX_LENGTH = 50;

const startingbuffer: string[] = [];
const tailbuffer: string[] = [];
let omittedCount = 0;

export function logToBuffer(line: string) {
  if (startingbuffer.length < START_BUFFER_MAX_LENGTH) {
    startingbuffer.push(line);
  } else {
    tailbuffer.push(line);
    while (tailbuffer.length > TAIL_BUFFER_MAX_LENGTH) {
      tailbuffer.shift();
      omittedCount++;
    }
  }
}

export function getLogBuffer(): Readonly<string[]> {
  if (tailbuffer.length > 0) {
    const result = [...startingbuffer];
    if (omittedCount > 0) {
      result.push('<<<<<<' + omittedCount.toString() + ' LOGS OMITTED>>>>>>>');
    }
    Array.prototype.push.apply(result, tailbuffer);
    return result;
  }
  return startingbuffer;
}

export function setupLogging(console: any) {
  const logHook = (f: (args?: any) => void, objects: any[]) => {
    try {
      logToBuffer(objects.map((o: any) => {
        if (o === null) {
          return 'null';
        }
        if (o === undefined) {
          return 'undefined';
        }
        if (o.stack) {
          return o.toString() + '<<<' + o.stack + '>>>';
        }
        const str = o.toString();
        if (str === '[object Object]') {
          try {
            return JSON.stringify(o).substr(0, 512);
          } catch (e) {
            return '<un-stringifiable Object>';
          }
        }
        return o.toString();
      }).join(' '));
      return f(...objects);
    } catch (e) {
      f(e);
    }
  };
  {
    const oldLog = console.log;
    console.log = (...objs: any[]) => logHook(oldLog, objs);

    const oldWarn = console.warn;
    console.warn = (...objs: any[]) => logHook(oldWarn, objs);

    const oldError = console.error;
    console.error = (...objs: any[]) => logHook(oldError, objs);
  }
}

// TODO record modal views as users navigate: ReactGA.modalview('/about/contact-us');
// likely as a separate logView or logNavigate or something
export function logEvent(category: string, action: string, argsInput: {[key: string]: any}): void {
  const ga = getGA();
  if (ga) {
    ga.event({
      category,
      action,
      label: argsInput.label || '',
      value: argsInput.value || undefined,
    });
  }
}
