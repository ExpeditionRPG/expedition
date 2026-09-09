import * as React from 'react';
import { shallow } from 'enzyme';
import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import { initialSettings } from 'app/reducers/Settings';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { EMPTY_COMBAT_STATE } from './Types';
import DrawEnemies from './DrawEnemies';
import { CombatPhase } from 'app/Constants';
function setup(enemies: any[]) {
  const props: any = {
    combat: { ...EMPTY_COMBAT_STATE, enemies },
    settings: initialSettings,
    node: {},
    tier: 3,
    onNext: jest.fn(),
    onTierSumDelta: jest.fn(),
  };
  return { props, e: shallow(<DrawEnemies {...props} />) };
}
test('renders each enemy with its tier', () => {
  const { e } = setup([
    { name: 'Thief', tier: 1 },
    { name: 'Brigand', tier: 2 },
  ]);
  expect(e.find('h2').map(h => h.text())).toEqual([
    'Thief (Tier I )',
    'Brigand (Tier II )',
  ]);
});
// Tier editing belongs to PlayerTier; this phase only previews enemies.
test('advances empty enemy previews to combat preparation without changing tier', () => {
  const { e, props } = setup([]);
  e.find(Button).simulate('click');
  expect(props.onNext).toHaveBeenCalledWith(props.node, CombatPhase.prepare);
  expect(props.onTierSumDelta).not.toHaveBeenCalled();
});
test('renders an empty enemy preview without fabricating enemy cards', () => {
  const { e } = setup([]);
  expect(e.find('h2')).toHaveLength(0);
  expect(e.find(Card).prop('title')).toBe('Draw Enemies');
});
