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
export function setStorageKeyValue(key: string, value: any) {
  try {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    } else {
      value = value.toString();
    }
    getLocalStorage().setItem(key, value);
  } catch (err) {
    console.error('Error setting storage key', key, 'to', value, err);
  }
}
