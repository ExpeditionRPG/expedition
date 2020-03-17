import * as React from 'react';
import Victory, {Props} from './Victory';
import {EMPTY_COMBAT_STATE} from './Types';
import {MAX_ADVENTURER_HEALTH} from 'app/Constants';
import {render} from 'app/Testing';
import {Expansion, CONTENT_SET_FULL_NAMES} from 'shared/schema/Constants';

const HEAL_SUBSTR = 'Heal';
const LOOT_SUBSTR = 'Draw Loot';
const LEVEL_SUBSTR = 'LEVEL UP!';
const HORROR_SUBSTR = CONTENT_SET_FULL_NAMES.horror;
const FUTURE_SUBSTR = CONTENT_SET_FULL_NAMES.future;

describe('Combat victory', () => {
  const TEST_VP = {
    heal: MAX_ADVENTURER_HEALTH,
    loot: true,
    xp: true,
  };

  function setup(overrides?: any) {
    const props: Props = {
      combat: {
        ...EMPTY_COMBAT_STATE,
        levelUp: true,
        loot: [],
      },
      victoryParameters: {...TEST_VP},
      settings: {
        showHelp: true,
      },
      theme: 'dark',
      contentSets: new Set(),
      onEvent: jasmine.createSpy('onEvent'),
      ...overrides,
    };
    return {props, e: render(<Victory {...(props as any as Props)} />)};
  }

  test('shows a victory page', () => {
    expect(setup().e.text()).toContain('Victory');
  });
  test('shows healing if healing given', () => {
    expect(setup({
      victoryParameters: {...TEST_VP, heal: MAX_ADVENTURER_HEALTH}
    }).e.text()).toContain(HEAL_SUBSTR);
  });
  test('hides healing if suppressed', () => {
    expect(setup({
      victoryParameters: {...TEST_VP, heal: 0}
    }).e.text()).not.toContain(HEAL_SUBSTR);
  });
  test('shows loot if loot given', () => {
    expect(setup({
      victoryParameters: {...TEST_VP, loot: true},
      combat: {
        ...EMPTY_COMBAT_STATE,
        loot: [{count: 1, tier: 1}],
      },
    }).e.text()).toContain('One tier I loot');
  });
  test('hides loot if loot suppressed', () => {
    expect(setup({
      victoryParameters: {...TEST_VP, loot: false}
    }).e.text()).not.toContain(LOOT_SUBSTR);
  });
  test('shows levelup if not suppressed and the party should level up', () => {
    expect(setup({
      victoryParameters: {...TEST_VP, xp: true}
    }).e.text()).toContain(LEVEL_SUBSTR);
  });
  test('hides levelup if suppressed', () => {
    expect(setup({
      victoryParameters: {...TEST_VP, xp: false}
    }).e.text()).not.toContain(LEVEL_SUBSTR);
  });
  test('shows horror tips if horror expansion', () => {
    expect(setup({
      settings: {showHelp: true},
      contentSets: new Set([Expansion.horror]),
    }).e.text()).toContain(HORROR_SUBSTR);
  });
  test('shows future tips if future expansion', () => {
    expect(setup({
      settings: {showHelp: true},
      contentSets: new Set(['future']),
    }).e.text()).toContain('skill');
  });
  test('hides expansion tips if no expansion', () => {
    const text = setup({
      settings: {showHelp: true},
      contentSets: new Set([]),
    }).e.text();
    expect(text).not.toContain(HORROR_SUBSTR);
    expect(text).not.toContain(FUTURE_SUBSTR);
  });
});
