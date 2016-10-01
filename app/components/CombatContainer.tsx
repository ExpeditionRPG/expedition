import { connect } from 'react-redux'
import {AppState, XMLElement} from '../reducers/StateTypes'
import {CombatPhaseNameType} from '../reducers/QuestTypes'
import {changeSetting} from '../actions/settings'
import {toPrevious, toCard, toCombatPhase} from '../actions/card'
import {handleEvent} from '../actions/quest'
import {handleCombatTimerStop} from '../actions/quest'
import Combat, {CombatStateProps, CombatDispatchProps} from './Combat'

const mapStateToProps = (state: AppState, ownProps: CombatStateProps): CombatStateProps => {
  // Set only the dynamic props (# alive players, round time total)
  //if ()
  //numAlivePlayers: number;
  //roundTimeTotalMillis: number;
  return ownProps;
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): CombatDispatchProps => {
  return {
    onNext: (phase: CombatPhaseNameType) => {
      dispatch(toCombatPhase(phase));
    },
    onTimerStop: (elapsedMillis: number) => {
      dispatch(handleCombatTimerStop(elapsedMillis));
      dispatch(toCombatPhase('RESOLVE_ABILITIES'));
    },
    onEvent: (event: string) => {
      dispatch(handleEvent(event));
      dispatch(toCard('QUEST_CARD'));
    },
    onReturn: () => {
      dispatch(toPrevious());
    }
  };
}

const CombatContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Combat);

export default CombatContainer