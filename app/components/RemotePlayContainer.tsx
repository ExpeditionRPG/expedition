import Redux from 'redux'
import {connect} from 'react-redux'
import {toCard} from '../actions/Card'
import {AppState, UserState} from '../reducers/StateTypes'
import {openSnackbar} from '../actions/Snackbar'
import {remotePlayConnect, remotePlayNewSession} from '../actions/RemotePlay'
import RemotePlay, {RemotePlayStateProps, RemotePlayDispatchProps} from './RemotePlay'
import {SessionID, SessionSecret} from 'expedition-qdl/lib/remote/Session'

const mapStateToProps = (state: AppState, ownProps: RemotePlayStateProps): RemotePlayStateProps => {
  return {
    phase: ownProps.phase,
    user: state.user,
    remotePlay: state.remotePlay,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RemotePlayDispatchProps => {
  return {
    onConnect: (user: UserState, secret: SessionSecret) => {
      if (secret.length !== 4) {
        return dispatch(openSnackbar('Please enter the full session code (4 characters)'));
      }
      return dispatch(remotePlayConnect(user, secret));
    },
    onReconnect: (user: UserState, id: SessionID) => {
      console.log('TODO RECONNECT ' + id);
      dispatch(toCard({name: 'REMOTE_PLAY', phase: 'LOBBY'}));
    },
    onNewSessionRequest: (user: UserState) => {
      return dispatch(remotePlayNewSession(user));
    },
    onLockSession: () => {
      console.log('TODO LOCKSESSION');
      dispatch(toCard({name: 'REMOTE_PLAY', phase: 'LOBBY'}));
    },
  };
}

const RemotePlayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RemotePlay);

export default RemotePlayContainer
