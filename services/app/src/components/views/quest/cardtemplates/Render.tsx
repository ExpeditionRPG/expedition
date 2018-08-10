import * as React from 'react';
import {REGEX} from 'shared/Regex';
import {CardThemeType} from '../../../../reducers/StateTypes';

// Replaces :icon_name: and [art_name] with appropriate HTML elements
// if [art_name] ends will _full, adds class="full"; otherwise defaults to display at 50% size
// art is hidden if it fails to load (aka offline)
export function generateIconElements(content: string, theme: CardThemeType): JSX.Element {
  content = (content || '').replace(new RegExp(REGEX.ICON.source, 'g'), (match: string, group: string): string => {
      const icon = group.toLowerCase();
      // TODO: we should confirm we have both regular and _white versions of icons and just make this auto-detect
      // based on the theme.
      const suffix = (theme === 'dark' && icon.indexOf('_white') === -1) ? '_white' : '';
      return `<img class="inline_icon" src="images/${icon}${suffix}_small.svg" />`;
    })
    .replace(new RegExp(REGEX.ART.source, 'g'), (match: string, group: string): string => {
      let imgName = `images/${group}`;
      let imgClass = 'artHalf';
      if (group.slice(-5) === '_full') {
        imgName = imgName.slice(0, -5);
        imgClass = 'artFull';
      }
      if (imgName.slice(-4) === '_png') {
        imgName = imgName.slice(0, -4) + '.png';
      } else {
        imgName = imgName + '.svg';
      }
      return `<div class="${imgClass}">
        <img class="art" src="${imgName.toLowerCase()}" onerror="this.style.display='none'" />
      </div>`;
    });
  return <span dangerouslySetInnerHTML={{__html: content }} />;
}

export const NUMERALS: {[k: number]: string; } = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

export function numberToWord(input: number): string {
  switch (input) {
    case 0: return 'zero';
    case 1: return 'one';
    case 2: return 'two';
    case 3: return 'three';
    case 4: return 'four';
    case 5: return 'five';
    case 6: return 'six';
    case 7: return 'seven';
    case 8: return 'eight';
    case 9: return 'nine';
    case 10: return 'ten';
    default: return input.toString();
  }
}

export function capitalizeFirstLetter(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}
