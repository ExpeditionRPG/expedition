import * as React from 'react'

import {MAX_COUNTER_HEALTH} from './Constants'

export function icon(theme: string, name: string): JSX.Element {
  return <img className="inline_icon svg" src={`/themes/${theme}/images/icon/${name}.svg`}/>;
}

export function iconString(theme: string, name: string): string {
  return `<img class="inline_icon svg" src="/themes/${theme}/images/icon/${name}.svg" />`;
}

export function camelCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '').replace(/'/, '');
}

export function romanize(num: number): string { // http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
  if (+num === 0) { return '0'; }
  if (!+num) { return ''; }
  var digits = String(+num).split(''),
      key = ['','C','CC','CCC','CD','D','DC','DCC','DCCC','CM',
             '','X','XX','XXX','XL','L','LX','LXX','LXXX','XC',
             '','I','II','III','IV','V','VI','VII','VIII','IX'],
      roman = '', i = 3;
  while (i--) {
    roman = (key[+digits.pop() + (i * 10)] || '') + roman;
  }
  return ((num < 0) ? '-' : '') + Array(+digits.join('') + 1).join('M') + roman;
}

// generates a bottom tracker, fits up to 14; inclusive 0-count
// TODO modernize
export function horizontalCounter(count: number): JSX.Element {

  let output = [];
  let outputted = 0;

  while (count >= 0) {
    output.push(<span key={outputted}>{outputted}</span>);
    count--;
    outputted++;
  }
  return <span>{output}</span>;
}

// generate U-shaped healthCounters with two special cases:
  // 10 health should fit into a single sidge
  // the number of numbers that fit onto the bottom track depends on the number of single vs double digit numbers
    // (since they have different widths)
// TODO modernize
export function healthCounter(health: number): JSX.Element {

  var digitWidth = [0, 16, 23];
  var maxWidth = 269;
  var outputtedWidth = 0;

  var max = false;
  if (health >= MAX_COUNTER_HEALTH) {
    health = MAX_COUNTER_HEALTH;
    max = true;
  }

  var output = '<ul class="hp-tracker hp-tracker-vertical-right">';
  var temp = ''; // temp storage for when we have to output in reverse in horizontal and vertical-right
  var outputted = (max) ? -1 : 0; // put one extra on the vertical to fill out max

  while (health > 0) {
    health--; //subtract HP first, since we're already showing the max HP at the top

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
  var digitWidth = [0, 16, 23];
  var maxWidth = 269;
  var outputtedWidth = 0;

  var output = '<ul class="hp-tracker hp-tracker-vertical-right">';
  var temp = ''; // temp storage for when we have to output in reverse in horizontal and vertical-right
  var outputted = 0;

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
    count--; //subtract count last, so that we get all the values
  }
  output += temp + '</ul>';
  return <span dangerouslySetInnerHTML={{__html: output}}></span>;
}
