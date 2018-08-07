/*
import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
configure({ adapter: new Adapter() });
import {initialCardState} from 'app/reducers/Card';
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {AppStateWithHistory, CardPhase} from 'app/reducers/StateTypes';
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

function setup(phase: CardPhase, overrides: Partial<Props>) {
  const props: Props = {
    settings: initialSettings,
    combat: newCombat(TEST_NODE),
    node: TEST_NODE.clone(),
    multiplayerState: initialMultiplayer,
    card: {...initialCardState, name: 'QUEST_CARD', phase},
    maxTier: 4,
    numAliveAdventurers: 3,
    tier: 4,
    seed: 'abcd',
    mostRecentRolls: undefined,
    victoryParameters: undefined,
    onAdventurerDelta: jasmine.createSpy('onAdventurerDelta'),
    onChoice: jasmine.createSpy('onChoice'),
    onCustomEnd: jasmine.createSpy('onCustomEnd'),
    onDecisionSetup: jasmine.createSpy('onDecisionSetup'),
    onDefeat: jasmine.createSpy('onDefeat'),
    onEvent: jasmine.createSpy('onEvent'),
    onNext: jasmine.createSpy('onNext'),
    onRetry: jasmine.createSpy('onRetry'),
    onReturn: jasmine.createSpy('onReturn'),
    onSurgeNext: jasmine.createSpy('onSurgeNext'),
    onTierSumDelta: jasmine.createSpy('onTierSumDelta'),
    onTimerHeld: jasmine.createSpy('onTimerHeld'),
    onTimerStart: jasmine.createSpy('onTimerStart'),
    onTimerStop: jasmine.createSpy('onTimerStop'),
    onVictory: jasmine.createSpy('onVictory'),
    ...overrides,
  };
  const enzymeWrapper = shallow(<Defeat {...props} />);
  return {props, enzymeWrapper};
}
*/

describe('Combat defeat', () => {
  it('does not show Retry button if onLose does not go to **end**');
  it('shows Retry button if onLose goes to **end**');
  it('hitting Retry returns the state to the card before combat');
});
