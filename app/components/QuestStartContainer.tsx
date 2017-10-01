import Redux from 'redux'
import {connect} from 'react-redux'
import {AppState} from '../reducers/StateTypes'
import {toCard, toPrevious} from '../actions/Card'
import QuestStart, {QuestStartStateProps, QuestStartDispatchProps} from './QuestStart'


const mapStateToProps = (state: AppState, ownProps: any): QuestStartStateProps => {
  return {
    settings: state.settings,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestStartDispatchProps => {
  return {
    onNext: () => {
      dispatch(toCard({name: 'QUEST_CARD'}));
    }
  };
}

const QuestStartContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestStart);

export default QuestStartContainer
