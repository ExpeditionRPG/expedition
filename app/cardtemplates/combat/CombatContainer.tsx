import Redux from 'redux'
import {connect} from 'react-redux'
import Combat, {CombatStateProps, CombatDispatchProps} from './Combat'
import {toPrevious, toCard} from '../../actions/Card'
import {handleCombatTimerStart, handleCombatTimerHold, handleCombatTimerStop, tierSumDelta, adventurerDelta, handleCombatEnd, midCombatChoice, handleResolvePhase, generateCombatTemplate} from './Actions'
import {event} from '../../actions/Quest'
import {AppStateWithHistory, SettingsType, CardName} from '../../reducers/StateTypes'
import {EventParameters} from '../../reducers/QuestTypes'
import {MidCombatPhase, CombatState} from './Types'
import {CombatPhase} from './Types'
import {MAX_ADVENTURER_HEALTH} from '../../Constants'
import {logEvent} from '../../Main'
import {TemplateContext, ParserNode} from '../TemplateTypes'
import {getMultiplayerClient} from '../../Multiplayer'
import {getStore} from '../../Store'

declare var window:any;

const mapStateToProps = (state: AppStateWithHistory, ownProps: CombatStateProps): CombatStateProps => {
  let maxTier = 0;
  let histIdx: number = state._history.length-1;
  // card.phase currently represents combat boundaries - non-combat cards don't use phases
  while (Boolean(state._history[histIdx]) && state._history[histIdx].quest && state._history[histIdx].quest.node && state._history[histIdx].quest.node.ctx.templates.combat && histIdx > 0) {
    const combat = state._history[histIdx].quest.node.ctx.templates.combat;
    if (!combat) {
      break;
    }
    const tier = combat.tier;
    histIdx--;
    const phase = state._history[histIdx].card.phase;
    if (tier && phase !== null && ['PREPARE', 'NO_TIMER'].indexOf(phase) !== -1) {
      maxTier = Math.max(maxTier, tier);
    }
  }

  const combatFromNode = (ownProps.node && ownProps.node.ctx && ownProps.node.ctx.templates && ownProps.node.ctx.templates.combat);
  const combat: CombatState = combatFromNode || generateCombatTemplate(state.settings, false, state.quest.node, getStore().getState);

  let victoryParameters: EventParameters = {
    heal: MAX_ADVENTURER_HEALTH,
    loot: true,
    xp: true,
  };
  if (combatFromNode) {
    if (!combat.custom) {
      const parsedParams = ownProps.node.getEventParameters('win');
      if (parsedParams !== null) {
        victoryParameters = parsedParams;
      }
    }
  }

  const stateCombat = (state.quest.node && state.quest.node.ctx && state.quest.node.ctx.templates && state.quest.node.ctx.templates.combat)
    || {tier: 0, mostRecentRolls: [10], numAliveAdventurers: 1};

  return {
    combat,
    card: ownProps.card,
    settings: state.settings,
    node: state.quest.node,
    maxTier,
    victoryParameters,
    // Override with dynamic state for tier and adventurer count
    // Any combat param change (e.g. change in tier) causes a repaint
    tier: stateCombat.tier,
    seed: state.quest.seed,
    mostRecentRolls: stateCombat.mostRecentRolls,
    numAliveAdventurers: stateCombat.numAliveAdventurers,
    remotePlayState: state.remotePlay,
  };
}

function postTimerReturn(dispatch: Redux.Dispatch<any>) {
  // Return to the "Ready for Combat?" card instead of doing the timed round again.
  dispatch(toPrevious({before: false, skip: [{name: 'QUEST_CARD', phase: 'TIMER'}]}));
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): CombatDispatchProps => {
  return {
    onNext: (phase: CombatPhase) => {
      dispatch(toCard({name: 'QUEST_CARD', phase}));
    },
    onVictory: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => {
      logEvent('combat_victory', {
        difficulty: settings.difficulty,
        maxTier,
        players: settings.numPlayers,
        label: settings.numPlayers,
        value: maxTier,
      });
      dispatch(handleCombatEnd({node, settings, victory: true, maxTier, seed}));
    },
    onRetry: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', before: true}));
    },
    onDefeat: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => {
      logEvent('combat_defeat', {
        difficulty: settings.difficulty,
        maxTier,
        players: settings.numPlayers,
        label: settings.numPlayers,
        value: maxTier,
      });
      dispatch(handleCombatEnd({node, settings, victory: false, maxTier, seed}));
    },
    onTimerStart: () => {
      dispatch(handleCombatTimerStart({}));
    },
    onTimerHeld: (node: ParserNode) => {
      // TODO
      //dispatch(handleCombatTimerHeld({node}));
    },
    onTimerStop: (node: ParserNode, settings: SettingsType, elapsedMillis: number, surge: boolean, seed: string) => {
      const remotePlayConnected = getMultiplayerClient().isConnected();

      // We don't want to **stop** the timer if we're connected to remote
      // play. Rather, we want to wait until everyone's timer is stopped
      // before moving on.
      // The server will tell us once everyone's ready.
      if (remotePlayConnected) {
        dispatch(handleCombatTimerHold({elapsedMillis}));
      } else {
        dispatch(handleCombatTimerStop({node, settings, elapsedMillis, seed}));
      }
    },
    onSurgeNext: (node: ParserNode) => {
      dispatch(handleResolvePhase({node}));
    },
    onReturn: () => {postTimerReturn(dispatch)},
    onEvent: (node: ParserNode, evt: string) => {
      dispatch(event({node, evt}));
    },
    onTierSumDelta: (node: ParserNode, current: number, delta: number) => {
      dispatch(tierSumDelta({node, current, delta}));
    },
    onAdventurerDelta: (node: ParserNode, settings: SettingsType, current: number, delta: number) => {
      dispatch(adventurerDelta({node, settings, current, delta}));
    },
    onCustomEnd: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', before: false}));
    },
    onChoice: (node: ParserNode, settings: SettingsType, index: number, maxTier: number, seed: string) => {
      dispatch(midCombatChoice({node, settings, index, maxTier, seed}));
    },
  };
}

const CombatContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Combat);

export default CombatContainer
