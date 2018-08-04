import {connect} from 'react-redux';
import Redux from 'redux';
import {AppStateWithHistory} from '../../reducers/StateTypes';
import MultiplayerSync, {DispatchProps, StateProps} from './MultiplayerSync';

const mapStateToProps = (state: AppStateWithHistory): StateProps => {
  return {
    multiplayer: state.multiplayer,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onAnimationComplete: () => {
      dispatch({type: 'INFLIGHT_COMPACT'});
    },
  };
};

const MultiplayerSyncContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiplayerSync);

export default MultiplayerSyncContainer;
