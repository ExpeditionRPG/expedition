import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
configure({ adapter: new Adapter() });
import {initialCardState} from 'app/reducers/Card';
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {CardPhase} from 'app/reducers/StateTypes';
import {defaultContext} from '../../Template';
import {ParserNode} from '../TemplateTypes';
import MidCombatDecision, {Props} from './Combat';
import {generateCombatDecision} from './decision/Actions';

const TEST_NODE = new ParserNode(cheerio.load('<combat><e>Test</e><e>Lich</e><e>lich</e><event on="win"></event><event on="lose"></event></combat>')('combat'), defaultContext());

function setup(overrides: Partial<Props>) {
  const settings = initialSettings;
  const multiplayerState = initialMultiplayer;
  const node = TEST_NODE.clone();
  const decision = generateCombatDecision(3);

  const props: Props = {
    settings,
    decision,
    node,
    multiplayerState,
    card: {...initialCardState, name: 'QUEST_CARD', phase: 'MID_COMBAT_DECISION'},
    seed: 'abcd',
    onDecisionSelect: jasmine.createSpy('onDecisionSelect'),
    onDecisionEnd: jasmine.createSpy('onDecisionEnd'),
    onDecisionRoll: jasmine.createSpy('onDecisionRoll'),
    onDecisionSetup: jasmine.createSpy('onDecisionSetup'),
    onDecisionTimerStart: jasmine.createSpy('onDecisionTimerStart'),
    ...overrides,
  };
  const enzymeWrapper = shallow(<Combat {...props} />);
  return {props, enzymeWrapper};
}

describe('MidCombatDecision', () => {
  it('shows a Decision element when no scenario chosen', () => {
    const {props, enzymeWrapper} = setup({});
  });

  it('shows a Decision element when outcome=retry');
  it('shows success page on outcome=success');
  it('shows failure page on outcome=failure');
  it('shows interrupted page on outcome=interrupted');
});
