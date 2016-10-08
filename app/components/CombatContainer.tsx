import { connect } from 'react-redux'
import {AppStateWithHistory, XMLElement, SettingsType} from '../reducers/StateTypes'
import {CombatPhaseNameType, MidCombatPhase} from '../reducers/QuestTypes'
import {toPrevious, toCard} from '../actions/card'
import {event, handleCombatTimerStop, combatDefeat, combatVictory, tierSumDelta, adventurerDelta} from '../actions/quest'
import Combat, {CombatStateProps, CombatDispatchProps} from './Combat'

const mapStateToProps = (state: AppStateWithHistory, ownProps: CombatStateProps): CombatStateProps => {
  var maxTier = 0;
  let histIdx: number = state._history.length-1;
  while(state._history[histIdx].combat !== undefined && histIdx > 0) {
    var tier = state._history[histIdx].combat.tier;
    if (!tier || state._history[histIdx].combat.phase !== 'PREPARE') {
      histIdx--;
      continue;
    }
    maxTier = Math.max(maxTier, tier);
    histIdx--;
  }
  console.log(maxTier);

  return {
    combat: Object.assign({}, ownProps.combat, {tier: state.combat.tier, numAliveAdventurers: state.combat.numAliveAdventurers}),
    node: ownProps.node,
    maxTier: maxTier,
    icon: ownProps.icon,
    settings: state.settings,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): CombatDispatchProps => {
  return {
    onNext: (phase: CombatPhaseNameType) => {
      dispatch(toCard('QUEST_CARD', phase));
    },
    onVictory: (maxTier: number, settings: SettingsType) => {
      dispatch(toCard('QUEST_CARD', 'VICTORY'));
      dispatch(combatVictory(settings.numPlayers, maxTier));
    },
    onDefeat: () => {
      dispatch(toCard('QUEST_CARD', 'DEFEAT'));
      dispatch(combatDefeat());
    },
    onTimerStop: (elapsedMillis: number, surge: boolean) => {
      if (surge) {
        dispatch(toCard('QUEST_CARD', 'SURGE'));
      } else {
        dispatch(toCard('QUEST_CARD', 'RESOLVE_ABILITIES'));
      }
      dispatch(handleCombatTimerStop(elapsedMillis));
    },
    onPostTimerReturn: () => {
      // Return to the "Ready for Combat?" card instead of doing the timed round again.
      dispatch(toPrevious('QUEST_CARD', 'PREPARE'));
    },
    onEvent: (node: XMLElement, evt: string) => {
      dispatch(event(node, evt));
    },
    onTierSumDelta: (delta: number) => {
      dispatch(tierSumDelta(delta));
    },
    onAdventurerDelta: (numPlayers: number, delta: number) => {
      dispatch(adventurerDelta(numPlayers, delta));
    },
  };
}

const CombatContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Combat);

export default CombatContainer