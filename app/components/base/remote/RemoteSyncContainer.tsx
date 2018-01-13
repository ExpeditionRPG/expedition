import Redux from 'redux'
import {connect} from 'react-redux'
import RemoteSync, {RemoteSyncStateProps, RemoteSyncDispatchProps} from './RemoteSync'
import {AppStateWithHistory} from '../../../reducers/StateTypes'

const mapStateToProps = (state: AppStateWithHistory, ownProps: RemoteSyncStateProps): RemoteSyncStateProps => {
  return {
    remotePlay: state.remotePlay,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RemoteSyncDispatchProps => {
  return {
    onAnimationComplete: () => {
      dispatch({type: 'INFLIGHT_COMPACT'});
    },
  };
}

const RemoteSyncContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RemoteSync);

export default RemoteSyncContainer;
