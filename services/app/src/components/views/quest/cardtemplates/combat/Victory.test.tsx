import * as React from 'react';
import Victory, {Props} from './Victory';
import {MAX_ADVENTURER_HEALTH} from 'app/Constants';
import {resolveCombat} from '../Params';
import {render} from 'app/Testing';

const HEAL_SUBSTR = 'Heal';
const LOOT_SUBSTR = 'Draw Loot';
const LEVEL_SUBSTR = 'LEVEL UP!';
const HORROR_SUBSTR = 'The Horror';
const FUTURE_SUBSTR = 'The Future';

describe('Combat victory', () => {
  const TEST_VP: VictoryParameters = {
    heal: MAX_ADVENTURER_HEALTH,
    loot: true,
    xp: true,
  };

  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      combat: {
        ...resolveCombat(null),
        custom:false,
        levelUp: true,
        loot: [],
      },
      victoryParameters: {...TEST_VP},
      settings: {
        showHelp: true,
        contentSets: {
          horror: false,
          future: false,
        },
      },
      theme: 'dark';
      onCustomEnd: jasmine.createSpy('onCustomEnd'),
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
      victoryParameters: {..TEST_VP, heal: MAX_ADVENTURER_HEALTH}
    }).e.text()).toContain(HEAL_SUBSTR);
  });
  test('hides healing if suppressed', () => {
    expect(setup({
      victoryParameters: {..TEST_VP, heal: 0}
    }).e.text()).not.toContain(HEAL_SUBSTR);
  });
  test('shows loot if loot given', () => {
    expect(setup({
      victoryParameters: {..TEST_VP, loot: true},
      combat: {
        ...resolveCombat(null),
        loot: [{count: 1, tier: 1}],
      },
    }).e.text()).toContain('One tier I loot');
  });
  test('hides loot if loot suppressed', () => {
    expect(setup({
      victoryParameters: {..TEST_VP, loot: false}
    }).e.text()).not.toContain(LOOT_SUBSTR);
  });
  test('shows levelup if not suppressed and the party should level up', () => {
    expect(setup({
      victoryParameters: {..TEST_VP, xp: true}
    }).e.text()).toContain(LEVEL_SUBSTR);
  });
  test('hides levelup if suppressed', () => {
    expect(setup({
      victoryParameters: {..TEST_VP, xp: false}
    }).e.text()).not.toContain(LEVEL_SUBSTR);
  });
  test('shows horror tips if horror expansion', () => {
    expect(setup({
      settings: {showHelp: true, contentSets: {horror: true}}
    }).e.text()).toContain(HORROR_SUBSTR);
  });
  test('shows future tips if future expansion', () => {
    expect(setup({
      settings: {showHelp: true, contentSets: {future: true}}
    }).e.text()).toContain(FUTURE_SUBSTR);
  });
  test('hides expansion tips if no expansion', () => {
    const text = setup({
      settings: {showHelp: true, contentSets: {future: false, horror: false}}
    }).e.text();
    expect(text).not.toContain(HORROR_SUBSTR);
    expect(text).not.toContain(FUTURE_SUBSTR);
  });
});
