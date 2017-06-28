import Redux from 'redux'
import {connect} from 'react-redux'

import Combat, {CombatStateProps, CombatDispatchProps} from './Combat'

import {getEventParameters} from '../../parser/Handlers'
import {toPrevious, toCard} from '../../actions/Card'
import {handleCombatTimerStop, tierSumDelta, adventurerDelta, handleCombatEnd} from './Actions'
import {event} from '../../actions/Quest'
import {AppStateWithHistory, SettingsType, CardName} from '../../reducers/StateTypes'
import {QuestContext, EventParameters} from '../../reducers/QuestTypes'
import {CombatPhase, MidCombatPhase} from './State'
import {ParserNode} from '../../parser/Node'
import {MAX_ADVENTURER_HEALTH} from '../../Constants'

declare var window:any;

const mapStateToProps = (state: AppStateWithHistory, ownProps: CombatStateProps): CombatStateProps => {
  let maxTier = 0;
  let histIdx: number = state._history.length-1;
  // card.phase currently represents combat boundaries - non-combat cards don't use phases
  while (Boolean(state._history[histIdx]) && state._history[histIdx].quest && state._history[histIdx].quest.node && state._history[histIdx].quest.node.ctx.templates.combat && histIdx > 0) {
    const tier = state._history[histIdx].quest.node.ctx.templates.combat.tier;
    if (!tier || state._history[histIdx].card.phase !== 'PREPARE') {
      histIdx--;
      continue;
    }
    maxTier = Math.max(maxTier, tier);
    histIdx--;
  }

  const combat = ownProps.node && ownProps.node.ctx && ownProps.node.ctx.templates && ownProps.node.ctx.templates.combat;

  let victoryParameters: EventParameters = null;
  if (combat) {
    if (!combat.custom) {
      victoryParameters = getEventParameters(ownProps.node, 'win');
    } else {
      victoryParameters = {
        heal: MAX_ADVENTURER_HEALTH,
        loot: true,
        xp: true,
      };
    }
  }

  return {
    ...combat,
    card: ownProps.card,
    settings: state.settings,
    node: state.quest && state.quest.node,
    maxTier,
    victoryParameters,
    // Override with dynamic state for tier and adventurer count
    // Any combat param change (e.g. change in tier) causes a repaint
    tier: state.quest.node.ctx.templates.combat.tier,
    numAliveAdventurers: state.quest.node.ctx.templates.combat.numAliveAdventurers,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): CombatDispatchProps => {
  return {
    onNext: (phase: CombatPhase) => {
      dispatch(toCard('QUEST_CARD', phase));
    },
    onVictory: (node: ParserNode, settings: SettingsType, maxTier: number) => {
      window.FirebasePlugin.logEvent('combat_victory', {difficulty: settings.difficulty, maxTier: maxTier, players: settings.numPlayers});
      dispatch(handleCombatEnd(node, settings, true, maxTier));
    },
    onDefeat: (node: ParserNode, settings: SettingsType, maxTier: number) => {
      window.FirebasePlugin.logEvent('combat_defeat', {difficulty: settings.difficulty, maxTier: maxTier, players: settings.numPlayers});
      dispatch(handleCombatEnd(node, settings, false, maxTier));
    },
    onTimerStop: (node: ParserNode, settings: SettingsType, elapsedMillis: number, surge: boolean) => {
      dispatch(handleCombatTimerStop(node, settings, elapsedMillis));
    },
    onPostTimerReturn: () => {
      // Return to the "Ready for Combat?" card instead of doing the timed round again.
      dispatch(toPrevious('QUEST_CARD', 'PREPARE'));
    },
    onEvent: (node: ParserNode, evt: string) => {
      dispatch(event(node, evt));
    },
    onTierSumDelta: (node: ParserNode, delta: number) => {
      dispatch(tierSumDelta(node, delta));
    },
    onAdventurerDelta: (node: ParserNode, settings: SettingsType, delta: number) => {
      dispatch(adventurerDelta(node, settings, delta));
    },
    onCustomEnd: () => {
      dispatch(toPrevious('QUEST_CARD', 'DRAW_ENEMIES', false));
    },
  };
}

const CombatContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Combat);

export default CombatContainer
