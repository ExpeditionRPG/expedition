import Redux from 'redux'
import {connect} from 'react-redux'

import Combat, {CombatStateProps, CombatDispatchProps} from './Combat'

import {toPrevious, toCard} from '../../actions/Card'
import {handleCombatTimerStop, tierSumDelta, adventurerDelta, handleCombatEnd} from './Actions'
import {event} from '../../actions/Quest'
import {AppStateWithHistory, SettingsType, CardName} from '../../reducers/StateTypes'
import {EventParameters} from '../../reducers/QuestTypes'
import {MidCombatPhase} from './State'
import {CombatPhase} from './Types'
import {ParserNode} from '../Template'
import {MAX_ADVENTURER_HEALTH} from '../../Constants'
import {midCombatChoice, handleResolvePhase} from './Actions'
import {logEvent} from '../../Main'
import {TemplateContext} from '../TemplateTypes'

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
      victoryParameters = ownProps.node.getEventParameters('win');
    } else {
      victoryParameters = {
        heal: MAX_ADVENTURER_HEALTH,
        loot: true,
        xp: true,
      };
    }
  }

  const stateCombat = (state.quest.node && state.quest.node.ctx && state.quest.node.ctx.templates && state.quest.node.ctx.templates.combat)
    || {tier: 0, mostRecentRolls: [10], numAliveAdventurers: 1};

  return {
    ...combat,
    card: ownProps.card,
    settings: state.settings,
    node: ownProps.node, // Persist state to prevent sudden jumps during card change.
    maxTier,
    victoryParameters,
    // Override with dynamic state for tier and adventurer count
    // Any combat param change (e.g. change in tier) causes a repaint
    tier: stateCombat.tier,
    seed: state.quest.seed,
    mostRecentRolls: stateCombat.mostRecentRolls,
    numAliveAdventurers: stateCombat.numAliveAdventurers,
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
    onTimerStop: (node: ParserNode, settings: SettingsType, elapsedMillis: number, surge: boolean, seed: string) => {
      dispatch(handleCombatTimerStop({node, settings, elapsedMillis, seed}));
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
    onChoice: (settings: SettingsType, parent: ParserNode, index: number) => {
      dispatch(midCombatChoice({settings, parent, index}));
    },
  };
}

const CombatContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Combat);

export default CombatContainer
