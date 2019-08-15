import {QuestNodeAction} from 'app/actions/ActionTypes';
import {audioSet} from 'app/actions/Audio';
import {toCard} from 'app/actions/Card';
import {numAdventurers} from 'app/actions/Settings';
import {openSnackbar} from 'app/actions/Snackbar';
import {MUSIC_INTENSITY_MAX} from 'app/Constants';
import {CardThemeType} from 'app/reducers/StateTypes';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import * as React from 'react';
import Redux from 'redux';
import {REGEX} from 'shared/Regex';
import {Quest} from 'shared/schema/Quests';
import {CombatPhase} from './combat/Types';
import {RoleplayPhase} from './roleplay/Types';
import {ParserNode} from './TemplateTypes';

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
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
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

export function capitalizeFirstLetter(input: string = ''): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function formatImg(img: string, theme: CardThemeType, small?: boolean) {
  if (theme === 'dark') {
    img += '_white';
  }
  if (small === undefined || small) {
    img += '_small';
  }
  return img;
}

export function findCombatParent(node: ParserNode): Cheerio|null {
  let elem = node && node.elem;
  while (elem !== null && elem.length > 0 && elem.get(0).tagName.toLowerCase() !== 'combat') {
    // Don't count roleplay nodes within "win" and "lose" events even if they're children of
    // a combat node; this is technically a roleplay state.
    if (/win|lose/.test(elem.attr('on'))) {
      return null;
    }
    elem = elem.parent();
  }

  if (elem === null || elem.length === 0) {
    return null;
  }

  return elem;
}

export function calculateAudioIntensity(node: ParserNode, adventurers: number): number {
  const combat = node.ctx.templates && node.ctx.templates.combat;
  if (!combat) {
    return 0;
  }
  const currentTier = combat.tier || 0;
  const deadAdventurers = adventurers - (combat.numAliveAdventurers || 0);
  const roundCount = combat.roundCount || 0;

  // TODO 0 if victory/defeat
  // Timerstart:  dispatch(audioSet({peakIntensity: 1}));

  // Some pretty arbitrary weights on different combat factors and how they affect music intensity
  // Optimized for a tier 3 fight being 12, tier 8 (max relevant tier) being 32
  // With intensity increasing generally over time, but fading off quickly as you defeat enemies
  return Math.round(Math.min(MUSIC_INTENSITY_MAX, 4 * currentTier + 4 * deadAdventurers + 0.5 * roundCount));
}

// Sets a new parser node and renders the expected initial state for the node.
// For combat, this is the "draw enemies" card.
export function setAndRenderNode(node: ParserNode, details?: Quest) {
  return (dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) => {
    // We set the quest state *after* updating the history to prevent
    // the history from grabbing the quest state before navigating.
    // This bug manifests as toPrevious() sliding back to the same card
    // content.
    dispatch({type: 'PUSH_HISTORY'});
    dispatch({
      type: 'QUEST_NODE',
      node,
      details,
    } as QuestNodeAction);

    // TODO(scott): reuse in roleplay/Actions.tsx and combat/Actions.tsx
    const tagName = node.elem.get(0).tagName;
    if (tagName === 'roleplay') {
      if (findCombatParent(node) !== null) {
        // Mid-combat roleplay
        dispatch(toCard({name: 'QUEST_CARD', phase: CombatPhase.midCombatRoleplay, overrideDebounce: true, noHistory: true}));
      } else {
        // Regular roleplay
        dispatch(toCard({name: 'QUEST_CARD', phase: RoleplayPhase.default, noHistory: true}));
      }
    } else if (tagName === 'combat') {
      console.log('tocarding');
      dispatch(toCard({name: 'QUEST_CARD', phase: node.ctx.templates.combat.phase, noHistory: true}));
      console.log('calculating audio');
      const intensity = calculateAudioIntensity(node, numAdventurers(getState().settings, getState().multiplayer));
      console.log('audio set');
      dispatch(audioSet({intensity}));
      console.log('done');
    } else if (tagName === 'decision') {
      const {phase, rolls} = node.ctx.templates.decision;
      dispatch(toCard({
        name: 'QUEST_CARD',
        phase,
        keySuffix: phase + rolls.toString(),
        noHistory: true,
      }));
    } else {
      dispatch(openSnackbar(`Failed to load quest (tag ${tagName})`));
    }
  };
}
