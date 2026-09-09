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
  test.skip('calculates max tier from history', () => {
    /* TODO */
  });
  test.skip('skips the timer card on prev button', () => {
    /* TODO */
  });
});
