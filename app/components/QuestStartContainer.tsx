import { connect } from 'react-redux'
import {AppState, XMLElement} from '../reducers/StateTypes'
import {changeSetting} from '../actions/settings'
import {toPrevious, toCard} from '../actions/card'
import QuestStart, {QuestStartStateProps, QuestStartDispatchProps} from './QuestStart'

const mapStateToProps = (state: AppState, ownProps: any): QuestStartStateProps => {
  return {
    node: state.quest.node
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestStartDispatchProps => {
  return {
    onNext: (node: XMLElement) => {
      dispatch(toCard('QUEST_CARD'));
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