import { connect } from 'react-redux'
import {AppState, XMLElement} from '../reducers/StateTypes'
import {CombatPhaseNameType, MidCombatPhase} from '../reducers/QuestTypes'
import {changeSetting} from '../actions/settings'
import {toPrevious, toCard, toCombatPhase} from '../actions/card'
import {handleEvent, handleCombatTimerStop, combatDefeat, combatVictory, tierSumDelta, adventurerDelta} from '../actions/quest'
import Combat, {CombatStateProps, CombatDispatchProps} from './Combat'

const mapStateToProps = (state: AppState, ownProps: CombatStateProps): CombatStateProps => {
  // Set only the dynamic props (# alive players, tier sum)

  //if ()
  //numAlivePlayers: number;
  //roundTimeTotalMillis: number;
  return Object.assign({}, ownProps, {
    tier: (state.quest.combat.phase as MidCombatPhase).tier || (ownProps.combat.phase as MidCombatPhase).tier,
    numAliveAdventurers: (state.quest.combat.phase as MidCombatPhase).numAliveAdventurers || (ownProps.combat.phase as MidCombatPhase).numAliveAdventurers,
  });
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): CombatDispatchProps => {
  return {
    onNext: (phase: CombatPhaseNameType) => {
      if (phase === 'DEFEAT') {
        dispatch(combatDefeat());
      } else if (phase === 'VICTORY') {
        dispatch(combatVictory());
      }
      dispatch(toCombatPhase(phase));
    },
    onTimerStop: (elapsedMillis: number, surge: boolean) => {
      dispatch(handleCombatTimerStop(elapsedMillis));
      if (surge) {
        dispatch(toCombatPhase('SURGE'));
      } else {
        dispatch(toCombatPhase('RESOLVE_ABILITIES'));
      }
    },
    onEvent: (event: string) => {
      dispatch(handleEvent(event));
      dispatch(toCard('QUEST_CARD'));
    },
    onReturn: () => {
      dispatch(toPrevious());
    },
    onTierSumDelta: (delta: number) => {
      dispatch(tierSumDelta(delta));
    },
    onAdventurerDelta: (delta: number) => {
      dispatch(adventurerDelta(delta));
    },
  };
}

const CombatContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Combat);

export default CombatContainer