import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
configure({ adapter: new Adapter() });
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {defaultContext} from '../../Template';
import {ParserNode} from '../../TemplateTypes';
import MidCombatDecision, {Props} from './MidCombatDecision';
import {generateCombatDecision} from './Actions';

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
    phase: 'PREPARE_DECISION',
    seed: 'abcd',
    onSelect: jasmine.createSpy('onSelect'),
    onEnd: jasmine.createSpy('onEnd'),
    onRoll: jasmine.createSpy('onRoll'),
    onTimerStart: jasmine.createSpy('onTimerStart'),
    ...overrides,
  };
  const enzymeWrapper = shallow(<MidCombatDecision {...props} />);
  return {props, enzymeWrapper};
}

describe('MidCombatDecision', () => {
  it('shows a Decision element when no scenario chosen', () => {
    const {enzymeWrapper} = setup({});
    expect(enzymeWrapper.type()).toEqual('Decision');
  });

  it('shows a Decision element when outcome=retry');
  it('shows success page on outcome=success');
  it('shows failure page on outcome=failure');
  it('shows interrupted page on outcome=interrupted');
});
