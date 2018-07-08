import * as React from 'react';
import {MAX_COUNTER_HEALTH} from './Constants';
import {TranslationsType} from './reducers/StateTypes';

export function icon(name: string, theme?: string, key?: number): JSX.Element {
  const globalSrc = `/expedition-art/icons/${name}.svg`;
  const themeSrc = (theme) ? `/themes/${theme}/images/icon/${name}.svg` : null;
  return <img key={(key === null) ? name : key} className={'inline_icon svg ' + name} src={themeSrc || globalSrc}/>;
}

export function camelCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter: string, index: number) => {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '').replace(/'/, '');
}

export function romanize(num: number): string { // http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
  if (+num === 0) { return '0'; }
  if (!+num) { return ''; }
  const digits = String(+num).split('');
  const key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
             '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
             '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  let roman = '';
  let i = 3;
  while (i--) {
    roman = (key[+(digits.pop() || 0) + (i * 10)] || '') + roman;
  }
  return ((num < 0) ? '-' : '') + Array(+digits.join('') + 1).join('M') + roman;
}

// generates a bottom tracker, fits up to 14; inclusive 0-count
// TODO modernize
export function horizontalCounter(count: number|string): JSX.Element {

  let numbers = [];
  const output = [];
  let outputted = 0;

  if (typeof count === 'string') {
    numbers = count.split(',');
    count = numbers.length;
  } else {
    numbers = [...Array(count + 1).keys()];
  }

  while (count >= 0) {
    output.push(<span key={outputted}>{numbers[outputted]}</span>);
    count--;
    outputted++;
  }
  return <span>{output}</span>;
}

// Returns the translated version of the string if available, otherwise the supplied English
export function translate(english: string, translations: TranslationsType): string {
  if (translations) {
    const translation = translations[english.toLowerCase()];
    if (translation) {
      return translation.toString(); // .toString() is just for typescript
    } else {
      console.error('Failed to locate translation for string: ' + english);
    }
  }
  return english;
}

// Turns "Tier 2 Loot" into the correct translation, respecting adjective order
export function translateTier(tier: number, english: string, translations: TranslationsType): string {
  const tierRoman = romanize(tier);
  if (translations) {
    const translated = translate(english, translations);
    const translatedTier = translate('Tier', translations);
    if (translations.AdjectiveAfterNoun) {
      return translated + ' ' + translatedTier + ' ' + tierRoman;
    } else {
      return translatedTier + ' ' + translated + ' ' + tierRoman;
    }
  }
  return 'Tier ' + tierRoman + ' ' + english;
}

// generate U-shaped healthCounters with two special cases:
  // 10 health should fit into a single sidge
  // the number of numbers that fit onto the bottom track depends on the number of single vs double digit numbers
    // (since they have different widths)
// TODO modernize
export function healthCounter(health: number, back = false): JSX.Element {

  const digitWidth = [0, 16, 23];
  let maxWidth = 269;
  let outputtedWidth = 0;

  if (back) {
    health = MAX_COUNTER_HEALTH + 1; // because the loop assumes you'll have the final value displayed
      // separately with a heart (as in, Encounter fronts), we have to force it to show all values here
  }

  let output = '<ul class="hp-tracker hp-tracker-vertical-right">';
  let temp = ''; // temp storage for when we have to output in reverse in horizontal and vertical-right
  let outputted = (back) ? -1 : 0; // put one extra on the vertical to fill out max

  while (health > 0) {
    health--; // subtract HP first, since we're already showing the max HP at the top

    if (outputted < 9 || (outputted === 9 && health === 0)) {
      output += '<li>' + health + '</li>';
    } else if (outputted === 9) { // vert-horiz transition point
      output += '</ul><table class="hp-tracker hp-tracker-horizontal"><tr>';
      temp = '<td>' + health + '</td>';
      outputtedWidth += digitWidth[health.toString().length];
    } else if (outputtedWidth + digitWidth[health.toString().length] < maxWidth) {
      temp = '<td>' + health + '</td>' + temp;
      outputtedWidth += digitWidth[health.toString().length];
    } else if (maxWidth > 0) { // horiz-vert transition
      output += temp + '</tr></table><ul class="hp-tracker hp-tracker-vertical-left">';
      temp = '<li>' + health + '</li>';
      maxWidth = 0;
    } else {
      temp = '<li>' + health + '</li>' + temp;
    }
    outputted++;
  }
  output += temp + '</ul>';
  return <span dangerouslySetInnerHTML={{__html: output}}></span>;
}

// same thing as hp tracker, but with different transition points
// TODO make unified function that takes in count and transition points
// also post-increments instead of pre-increments, so maybe pass an output range (ie loot is 20-1, HP is 19-0)
// TODO modernize
export function lootCounter(count: number): JSX.Element {
  const digitWidth = [0, 16, 23];
  let maxWidth = 269;
  let outputtedWidth = 0;

  let output = '<ul class="hp-tracker hp-tracker-vertical-right">';
  let temp = ''; // temp storage for when we have to output in reverse in horizontal and vertical-right
  let outputted = 0;

  while (count > 0) {
    if (outputted < 15 || (outputted === 15 && count === 0)) {
      output += '<li>' + count + '</li>';
    } else if (outputted === 15) { // vert-horiz transition point
      output += '</ul><table class="hp-tracker hp-tracker-horizontal"><tr>';
      temp = '<td>' + count + '</td>';
      outputtedWidth += digitWidth[count.toString().length];
    } else if (outputtedWidth + digitWidth[count.toString().length] < maxWidth) {
      temp = '<td>' + count + '</td>' + temp;
      outputtedWidth += digitWidth[count.toString().length];
    } else if (maxWidth > 0) { // horiz-vert transition
      output += temp + '</tr></table><ul class="hp-tracker hp-tracker-vertical-left">';
      temp = '<li>' + count + '</li>';
      maxWidth = 0;
    } else {
      temp = '<li>' + count + '</li>' + temp;
    }
    outputted++;
    count--; // subtract count last, so that we get all the values
  }
  output += temp + '</ul>';
  return <span dangerouslySetInnerHTML={{__html: output}}></span>;
}
