import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
configure({ adapter: new Adapter() });
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {defaultContext} from '../Template';
import {ParserNode} from '../TemplateTypes';
import {generateCombatTemplate} from './Actions';
import Defeat, {Props} from './Defeat';
import {CombatState} from './Types';

const cheerio: any = require('cheerio');
const TEST_NODE = new ParserNode(cheerio.load('<combat><e>Thief</e><e>Brigand</e><e>Footpad</e><event on="win"></event><event on="lose"></event></combat>')('combat'), defaultContext());

function newCombat(node: ParserNode): CombatState {
  return generateCombatTemplate(initialSettings, false, node, () => ({multiplayer: initialMultiplayer} as any as AppStateWithHistory));
}

function setup(overrides: Partial<Props>) {
  const props: Props = {
    settings: initialSettings,
    combat: newCombat(TEST_NODE),
    node: TEST_NODE.clone(),
    seed: '123',
    mostRecentRolls: undefined,
    onEvent: jasmine.createSpy('onEvent'),
    onRetry: jasmine.createSpy('onRetry'),
    ...overrides,
  };
  const e = shallow(<Defeat {...props} />);
  return {props, e};
}

describe('DefeatContainer', () => {
  test('handles undefined combat element', () => {
    const e = setup({combat: undefined});
    expect(e).toBeDefined();
  });
  test.skip('calculates max tier from history', () => { /* TODO */ });
  test.skip('skips the timer card on prev button', () => { /* TODO */ });
});
