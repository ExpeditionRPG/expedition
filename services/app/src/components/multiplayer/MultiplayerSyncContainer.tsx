import {connect} from 'react-redux';
import Redux from 'redux';
import {AppStateWithHistory} from '../../reducers/StateTypes';
import MultiplayerSync, {MultiplayerSyncDispatchProps, MultiplayerSyncStateProps} from './MultiplayerSync';

const mapStateToProps = (state: AppStateWithHistory, ownProps: MultiplayerSyncStateProps): MultiplayerSyncStateProps => {
  return {
    multiplayer: state.multiplayer,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MultiplayerSyncDispatchProps => {
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
