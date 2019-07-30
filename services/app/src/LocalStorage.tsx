import {getLocalStorage} from './Globals';

// Force specifying a default, since just doing (|| fallback) would bork on stored falsey values
export function getStorageBoolean(key: string, fallback: boolean): boolean {
  const val = getLocalStorage().getItem(key);
  return (val !== null) ? (val.toLowerCase() === 'true') : fallback;
}

export function getStorageJson(key: string, fallback: object): object {
  try {
    const item = getLocalStorage().getItem(key);
    if (item === null) {
      return fallback;
    }
    const val = JSON.parse(item);
    return (val !== null) ? val : fallback;
  } catch (err) {
    return fallback;
  }
}

export function getStorageNumber(key: string, fallback: number): number {
  const val = getLocalStorage().getItem(key);
  return (val !== null) ? Number(val) : fallback;
}

export function getStorageString(key: string, fallback: string): string {
  const val = getLocalStorage().getItem(key);
  return (val !== null) ? val : fallback;
}

// Value can be boolean, number, string or stringifiable JSON
export function setStorageKeyValue(key: string, value: any, ignoreErrors= true) {
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  } else {
    value = value.toString();
  }
  getLocalStorage().setItem(key, value);
}

// Check for free space in local storage by allocating space.
// We don't check for free space past 10MiB; it's assumed
// the user won't care about storage space past that point.
export function checkStorageFreeBytes(gls = getLocalStorage): number {
  const ls = gls();
  let min = 0; // Kib
  let max = 10000; // Kib
  const n1000b = '0123456789'.repeat(100);
  // Converging on 10MiB would take log_2(10M) = 24 iterations.
  // If we're past this limit, something's gone wrong and we
  // should bail out with our best guess.
  const CHECK_MAX_ITERATIONS = 50;
  let i = 0;
  while (Math.abs(max - min) > 1 && i < CHECK_MAX_ITERATIONS) {
    const test = Math.floor((max - min) / 2 + min);
    try {
      ls.setItem('test', n1000b.repeat(test));
      // If no exception, we're under the max. Raise min.
      min = test;
    } catch (e) {
      // If exception, we're over the max. Lower max.
      max = test;
    }
    i++;
  }

  try {
    ls.setItem('test', null as any);
  } catch (e) {
    // Ignore errors
  }
  return min * 1000;
}
