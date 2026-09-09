import { newMockStoreWithInitializedState, newMockStore } from 'app/Testing';
import { mapStateToProps, mapDispatchToProps } from './DefeatContainer';
import { CombatPhase } from 'app/Constants';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { initialSettings } from 'app/reducers/Settings';
import { AppStateWithHistory } from 'app/reducers/StateTypes';
import { shallow } from 'enzyme';
import * as React from 'react';
import { defaultContext } from '../Template';
import { ParserNode } from '../TemplateTypes';
import { generateCombatTemplate } from './Actions';
import Defeat, { Props } from './Defeat';
import { CombatState } from './Types';

import * as cheerio from 'shared/Cheerio';
const TEST_NODE = new ParserNode(
  cheerio.load(
    '<combat><e>Thief</e><e>Brigand</e><e>Footpad</e><event on="win"></event><event on="lose"></event></combat>',
  )('combat'),
  defaultContext(),
);

function newCombat(node: ParserNode): CombatState {
  return generateCombatTemplate(
    initialSettings,
    false,
    node,
    () => ({ multiplayer: initialMultiplayer }) as any as AppStateWithHistory,
  );
}

function setup(overrides: Partial<Props>) {
  const props: Props = {
    settings: initialSettings,
    combat: newCombat(TEST_NODE),
    node: TEST_NODE.clone(),
    seed: '123',
    mostRecentRolls: undefined,
    onEvent: jest.fn(),
    onRetry: jest.fn(),
    ...overrides,
  };
  const e = shallow(<Defeat {...props} />);
  return { props, e };
}

describe('DefeatContainer', () => {
  test('handles undefined combat element', () => {
    const e = setup({ combat: undefined });
    expect(e).toBeDefined();
  });
  test('maps combat state and latest rolls from the current quest', () => {
    const state = newMockStoreWithInitializedState().getState();
    const node = TEST_NODE.clone();
    node.ctx.templates.combat = newCombat(node);
    node.ctx.templates.combat.mostRecentRolls = [12, 7];
    state.quest.node = node;
    const result = mapStateToProps(state, { node });
    expect(result.combat).toBe(node.ctx.templates.combat);
    expect(result.mostRecentRolls).toEqual([12, 7]);
  });
  test('Retry requests the history entry before combat and skips timer phases', () => {
    const store = newMockStoreWithInitializedState();
    const props = mapDispatchToProps(store.dispatch);
    props.onRetry();
    const action = store.getActions().find(a => a.type === 'RETURN');
    expect(action.before).toBe(true);
    const node = TEST_NODE.clone();
    node.ctx.templates.combat = newCombat(node);
    node.ctx.templates.combat.phase = CombatPhase.drawEnemies;
    expect(action.matchFn('QUEST_CARD', node)).toBe(true);
    node.ctx.templates.combat.phase = CombatPhase.timer;
    expect(action.matchFn('QUEST_CARD', node)).toBe(false);
  });
});
