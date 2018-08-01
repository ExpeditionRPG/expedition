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
  handleDecisionRoll,
  handleDecisionSelect,
  handleDecisionTimerStart,
} from '../decision/Actions';
import {DecisionState, DecisionType, EMPTY_DECISION_STATE} from '../decision/Types';
import {ParserNode} from '../TemplateTypes';
import {
  adventurerDelta,
  generateCombatTemplate,
  handleCombatEnd,
  handleCombatTimerHold,
  handleCombatTimerStart,
  handleCombatTimerStop,
  handleResolvePhase,
  midCombatChoice,
  tierSumDelta,
  toDecisionCard
} from './Actions';
import Combat, {DispatchProps, StateProps} from './Combat';
import {CombatPhase, CombatState} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  let maxTier = 0;
  let histIdx: number = state._history.length - 1;
  // card.phase currently represents combat boundaries - non-combat cards don't use phases
  while (Boolean(state._history[histIdx]) && state._history[histIdx].quest && state._history[histIdx].quest.node && state._history[histIdx].quest.node.ctx.templates.combat && histIdx > 0) {
    const combatContext = state._history[histIdx].quest.node.ctx.templates.combat;
    if (!combatContext) {
      break;
    }
    const tier = combatContext.tier;
    histIdx--;
    const phase = state._history[histIdx].card.phase;
    if (tier && phase !== null && ['PREPARE', 'NO_TIMER'].indexOf(phase) !== -1) {
      maxTier = Math.max(maxTier, tier);
    }
  }

  const card = ownProps.card;
  const node = ownProps.node;
  if (!node || !card) {
    throw Error('Incomplete props given');
  }

  const combatFromNode = (node && node.ctx && node.ctx.templates && node.ctx.templates.combat);
  const combat: CombatState = combatFromNode || generateCombatTemplate(state.settings, false, state.quest.node, getStore().getState);

  let victoryParameters: EventParameters = {
    heal: MAX_ADVENTURER_HEALTH,
    loot: true,
    xp: true,
  };
  if (combatFromNode) {
    if (!combat.custom) {
      const parsedParams = node.getEventParameters('win');
      if (parsedParams !== null) {
        victoryParameters = parsedParams;
      }
    }
  }

  const stateCombat = (state.quest.node && state.quest.node.ctx && state.quest.node.ctx.templates && state.quest.node.ctx.templates.combat)
    || {tier: 0, mostRecentRolls: [10], numAliveAdventurers: 1};

  const decision = (node && node.ctx && node.ctx.templates && node.ctx.templates.decision)
  || EMPTY_DECISION_STATE;

  // Override with dynamic state for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    card,
    combat,
    decision,
    maxTier,
    mostRecentRolls: stateCombat.mostRecentRolls,
    multiplayerState: state.multiplayer,
    node: state.quest.node,
    numAliveAdventurers: stateCombat.numAliveAdventurers,
    seed: state.quest.seed,
    settings: state.settings,
    tier: stateCombat.tier,
    victoryParameters,
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
    onDecisionChoice: (node: ParserNode, settings: SettingsType, choice: DecisionType, elapsedMillis: number, seed: string) => {
      dispatch(handleDecisionSelect({node, settings, elapsedMillis, decision: choice, seed}));
      dispatch(toDecisionCard({phase: 'RESOLVE_DECISION'}));
    },
    onDecisionEnd: () => {
      dispatch(toCard({name: 'QUEST_CARD', phase: 'PREPARE'}));
    },
    onDecisionRoll: (node: ParserNode, settings: SettingsType, decision: DecisionState, roll: number, seed: string) => {
      dispatch(handleDecisionRoll({node, settings, scenario: decision.scenario, roll, seed}));
      dispatch(toDecisionCard({phase: 'RESOLVE_DECISION', numOutcomes: decision.outcomes.length}));
    },
    onDecisionSetup: () => {
      dispatch(toDecisionCard({phase: 'PREPARE_DECISION'}));
    },
    onDecisionTimerStart: () => {
      dispatch(handleDecisionTimerStart({}));
      dispatch(toDecisionCard({phase: 'DECISION_TIMER'}));
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

const CombatContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Combat);

export default CombatContainer;
