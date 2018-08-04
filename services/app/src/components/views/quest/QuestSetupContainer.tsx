import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../../actions/Card';
import {AppState} from '../../../reducers/StateTypes';
import QuestSetup, {DispatchProps, StateProps} from './QuestSetup';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onNext: () => {
      dispatch(toCard({name: 'QUEST_CARD'}));
    },
  };
};

const QuestSetupContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestSetup);

export default QuestSetupContainer;
