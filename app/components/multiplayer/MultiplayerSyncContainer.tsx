import Redux from 'redux'
import {connect} from 'react-redux'
import MultiplayerSync, {MultiplayerSyncStateProps, MultiplayerSyncDispatchProps} from './MultiplayerSync'
import {AppStateWithHistory} from '../../reducers/StateTypes'

const mapStateToProps = (state: AppStateWithHistory, ownProps: MultiplayerSyncStateProps): MultiplayerSyncStateProps => {
  return {
    remotePlay: state.remotePlay,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MultiplayerSyncDispatchProps => {
  return {
    onAnimationComplete: () => {
      dispatch({type: 'INFLIGHT_COMPACT'});
    },
  };
}

const MultiplayerSyncContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiplayerSync);

export default MultiplayerSyncContainer;
