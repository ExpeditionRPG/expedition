import {toCard, toPrevious} from 'app/actions/Card';
import {event} from 'app/actions/Quest';
import {MAX_ADVENTURER_HEALTH} from 'app/Constants';
import {logEvent} from 'app/Logging';
import {getMultiplayerClient} from 'app/Multiplayer';
import {EventParameters} from 'app/reducers/QuestTypes';
import {AppStateWithHistory, SettingsType} from 'app/reducers/StateTypes';
import {getStore} from 'app/Store';
import {connect} from 'react-redux';
import Redux from 'redux';
import {
  midCombatChoice,
} from '../roleplay/Actions';
import {ParserNode} from '../TemplateTypes';
import {
  adventurerDelta,
  generateCombatTemplate,
  handleCombatEnd,
  handleCombatTimerHold,
  handleCombatTimerStart,
  handleCombatTimerStop,
  handleResolvePhase,
  setupCombatDecision,
  tierSumDelta,
} from './Actions';
import NoTimer, {DispatchProps, StateProps} from './NoTimer';
import {CombatPhase, CombatState} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  const node = ownProps.node;
  if (!node || !card) {
    throw Error('Incomplete props given');
  }
  return {
    node: state.quest.node,
    seed: state.quest.seed,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onAdventurerDelta: (node: ParserNode, settings: SettingsType, current: number, delta: number) => {
      dispatch(adventurerDelta({node, settings, current, delta}));
    },
    onChoice: (node: ParserNode, settings: SettingsType, index: number, maxTier: number, seed: string) => {
      dispatch(midCombatChoice({node, settings, index, maxTier, seed}));
    },
    onCustomEnd: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', before: false}));
    },
    onDecisionSetup: (node: ParserNode, seed: string) => {
      dispatch(setupCombatDecision({node, seed}));
    },
    onDefeat: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => {
      logEvent('combat_defeat', {
        difficulty: settings.difficulty,
        label: settings.numPlayers,
        maxTier,
        players: settings.numPlayers,
        value: maxTier,
      });
      dispatch(handleCombatEnd({node, settings, victory: false, maxTier, seed}));
    },
    onEvent: (node: ParserNode, evt: string) => {
      dispatch(event({node, evt}));
    },
    onNext: (phase: CombatPhase) => {
      dispatch(toCard({name: 'QUEST_CARD', phase}));
    },
    onRetry: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', before: true}));
    },
    onReturn: () => {
      // Return to the "Ready for Combat?" card instead of doing the timed round again.
      dispatch(toPrevious({before: false, skip: [{name: 'QUEST_CARD', phase: 'TIMER'}]}));
    },
    onSurgeNext: (node: ParserNode) => {
      dispatch(handleResolvePhase({node}));
    },
    onTierSumDelta: (node: ParserNode, current: number, delta: number) => {
      dispatch(tierSumDelta({node, current, delta}));
    },
    onTimerHeld: (node: ParserNode) => {
      // TODO
      // dispatch(handleCombatTimerHeld({node}));
    },
    onTimerStart: () => {
      dispatch(handleCombatTimerStart({}));
    },
    onTimerStop: (node: ParserNode, settings: SettingsType, elapsedMillis: number, surge: boolean, seed: string) => {
      const multiplayerConnected = getMultiplayerClient().isConnected();

      // We don't want to **stop** the timer if we're connected to remote
      // play. Rather, we want to wait until everyone's timer is stopped
      // before moving on.
      // The server will tell us once everyone's ready.
      if (multiplayerConnected) {
        dispatch(handleCombatTimerHold({elapsedMillis}));
      } else {
        dispatch(handleCombatTimerStop({node, settings, elapsedMillis, seed}));
      }
    },
    onVictory: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => {
      logEvent('combat_victory', {
        difficulty: settings.difficulty,
        label: settings.numPlayers,
        maxTier,
        players: settings.numPlayers,
        value: maxTier,
      });
      dispatch(handleCombatEnd({node, settings, victory: true, maxTier, seed}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoTimer);
