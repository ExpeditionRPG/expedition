import { connect } from 'react-redux'
import {AppState, QuestAction} from '../reducers/StateTypes'
import {changeSetting} from '../actions/settings'
import {toFirstQuestCard, toPrevious} from '../actions/card'
import QuestStart, {QuestStartStateProps, QuestStartDispatchProps} from './QuestStart'
import {XMLElement} from '../scripts/QuestParser'


const mapStateToProps = (state: AppState, ownProps: any): QuestStartStateProps => {
  return {
    firstElem: (state.card[state.card.length-1] as QuestAction).node
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestStartDispatchProps => {
  return {
    onNext: (firstElem: XMLElement) => {
      dispatch(toFirstQuestCard((firstElem)));
    },
    onReturn: () => {
      dispatch(toPrevious());
    }
  };
}

const QuestStartContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestStart);

export default QuestStartContainer