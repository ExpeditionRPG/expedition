import { connect } from 'react-redux'
import {AppState, QuestAction} from '../reducers/StateTypes'
import {changeSetting} from '../actions/settings'
import {toPrevious, toCombat, handleQuestEvent} from '../actions/card'
import {XMLElement, CombatPhase, loadCombatNode} from '../scripts/QuestParser'
import Combat, {CombatStateProps, CombatDispatchProps} from './Combat'

const mapStateToProps = (state: AppState, ownProps: CombatStateProps): CombatStateProps => {
  return ownProps;
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): CombatDispatchProps => {
  return {
    onNext: (node: XMLElement, phase: CombatPhase) => {
      dispatch(toCombat(node, phase)); // TODO
    },
    onEvent: (node: XMLElement, event: string) => {
      dispatch(handleQuestEvent(node, event));
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