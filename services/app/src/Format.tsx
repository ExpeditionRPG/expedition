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

export function smartTruncateSummary(summary: string) {
  // Extract sentences
  const match = summary.match(/(.*?(?:\.|\?|!))(?: |$)/gm);

  if (match === null) {
    return summary;
  }

  let result = '';
  for (const m of match) {
    if (result.length + m.length > 120) {
      if (result === '') {
        return summary.trim();
      }

      result = result.trim();
      if (result.endsWith('.')) {
        // Continue a natural ellispis
        return result + '..';
      }
      return result;
    }
    result += m;
  }
  return summary.trim();
}
