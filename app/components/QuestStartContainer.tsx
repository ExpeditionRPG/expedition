import {connect} from 'react-redux'
import {AppState, XMLElement} from '../reducers/StateTypes'
import {toCard, toPrevious} from '../actions/card'
import QuestStart, {QuestStartStateProps, QuestStartDispatchProps} from './QuestStart'


const mapStateToProps = (state: AppState, ownProps: any): QuestStartStateProps => {
  return {
    node: state.quest.node,
    settings: state.settings,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestStartDispatchProps => {
  return {
    onNext: (node: XMLElement) => {
      dispatch(toCard('QUEST_CARD'));
    }
  };
}

const QuestStartContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestStart);

export default QuestStartContainer
