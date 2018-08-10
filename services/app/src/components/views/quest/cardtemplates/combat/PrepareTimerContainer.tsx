import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {
  handleCombatTimerStart,
} from './Actions';
import PrepareTimer, {DispatchProps, StateProps} from './PrepareTimer';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return {
    node: ownProps.node || state.quest.node,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onTimerStart: () => {
      dispatch(handleCombatTimerStart({}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrepareTimer);
