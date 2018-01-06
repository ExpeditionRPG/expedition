import Redux from 'redux'
import {connect} from 'react-redux'
import {AppState} from '../reducers/StateTypes'
import {toCard, toPrevious} from '../actions/Card'
import QuestSetup, {QuestSetupStateProps, QuestSetupDispatchProps} from './QuestSetup'


const mapStateToProps = (state: AppState, ownProps: any): QuestSetupStateProps => {
  return {
    settings: state.settings,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestSetupDispatchProps => {
  return {
    onNext: () => {
      dispatch(toCard({name: 'QUEST_CARD'}));
    }
  };
}

const QuestSetupContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestSetup);

export default QuestSetupContainer
