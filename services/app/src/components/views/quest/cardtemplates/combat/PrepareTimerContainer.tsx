import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {
  handleCombatTimerStart,
} from './Actions';
import PrepareTimer, {DispatchProps} from './PrepareTimer';
import {mapStateToProps as mapStateToPropsBase, StateProps} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return mapStateToPropsBase(state, ownProps);
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
