// General-use string formatting of quest details and other data.

export function formatPlayPeriod(minMinutes: number, maxMinutes: number): string {
  if (maxMinutes >= 999) {
    if (minMinutes >= 999) {
      return '2+ hrs';
    } else if (minMinutes >= 60) {
      return Math.round(minMinutes / 60) + '+ hrs';
    } else {
      return Math.round(minMinutes) + '+ min';
    }
  } else if (minMinutes >= 60 && maxMinutes >= 60) {
    return Math.round(minMinutes / 60) + '-' + Math.round(maxMinutes / 60) + ' hrs';
  } else {
    return minMinutes + '-' + maxMinutes + ' min';
  }
}
