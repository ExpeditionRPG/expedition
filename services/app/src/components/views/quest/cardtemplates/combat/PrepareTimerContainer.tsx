import {connect} from 'react-redux';
import Redux from 'redux';
import {
  handleCombatTimerStart,
} from './Actions';
import PrepareTimer, {DispatchProps} from './PrepareTimer';
import {mapStateToProps} from './Types';

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
