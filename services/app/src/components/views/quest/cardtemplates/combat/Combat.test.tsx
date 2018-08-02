import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
configure({ adapter: new Adapter() });
import {initialCardState} from 'app/reducers/Card';
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {CardPhase, AppStateWithHistory} from 'app/reducers/StateTypes';
import {defaultContext} from '../Template';
import {ParserNode} from '../TemplateTypes';
import {generateCombatTemplate} from './Actions';
import Combat, {Props} from './Combat';
import {ENCOUNTERS} from 'app/Encounters';
import {CombatState} from './Types';

const TEST_NODE = new ParserNode(cheerio.load('<combat><e>Test</e><e>Lich</e><e>lich</e><event on="win"></event><event on="lose"></event></combat>')('combat'), defaultContext());

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
  const enzymeWrapper = shallow(<Combat {...props} />);
  return {props, enzymeWrapper};
}

describe('Combat', () => {
  describe('DRAW_ENEMIES', () => {
    it('renders all enemies in props', () => {
      let combat = newCombat(TEST_NODE);
      combat.enemies.push(ENCOUNTERS['thief']);
      combat.enemies.push(ENCOUNTERS['brigand']);
      combat.enemies.push(ENCOUNTERS['footpad']);
      const {enzymeWrapper} = setup('DRAW_ENEMIES', {combat});
      expect(enzymeWrapper.find('h2.draw_enemies').map(e => e.text())).toEqual(['Thief (I)', 'Brigand (II)', 'Footpad (II)']);
    });
  });

  describe('NO_TIMER', () => {
    it('shows non-timer prep card');
  });

  describe('PREPARE', () => {
    it('shows preparation card');
  });

  describe('TIMER', () => {
    it('shows timer card');
  });

  describe('SURGE', () => {
    it('shows surge card');
  });

  describe('RESOLVE_ABILITIES', () => {
    it('shows horror persona helper');
    it('shows rolls if enabled in settings');
  });

  describe('RESOLVE_DAMAGE', () => {
    it('starts at current player and tier count');
  });

  describe('VICTORY', () => {
    it('shows a victory page');
    it('shows healing if not suppressed');
    it('shows loot if not suppressed');
    it('shows levelup if not suppressed');
  });

  describe('DEFEAT', () => {
    it('does not show Retry button if onLose does not go to **end**');
    it('shows Retry button if onLose goes to **end**');
    it('hitting Retry returns the state to the card before combat');
  });

  describe('MID_COMBAT_ROLEPLAY', () => {
    it('shows the current parsernode in a dark theme');
  });
});
