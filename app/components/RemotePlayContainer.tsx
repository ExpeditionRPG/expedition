import Redux from 'redux'
import { connect } from 'react-redux'
import {toCard} from '../actions/Card'
import {AppState, UserState} from '../reducers/StateTypes'
import {openSnackbar} from '../actions/Snackbar'
import {remotePlayConnect} from '../actions/Web'
import RemotePlay, {RemotePlayStateProps, RemotePlayDispatchProps} from './RemotePlay'

const mapStateToProps = (state: AppState, ownProps: RemotePlayStateProps): RemotePlayStateProps => {
  return {
    phase: ownProps.phase,
    user: state.user
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RemotePlayDispatchProps => {
  return {
    onConnect: (user: UserState, secret: string) => {
      if (secret.length !== 4) {
        return dispatch(openSnackbar('Please enter the full session code (4 characters)'));
      }
      return dispatch(remotePlayConnect(user, secret));
    },
    onReconnect: (user: UserState, id: string) => {
      console.log('TODO RECONNECT ' + id);
      dispatch(toCard('REMOTE_PLAY', 'LOBBY'));
    },
    onNewSessionRequest: () => {
      console.log('TODO NEWSESSION');
      dispatch(toCard('REMOTE_PLAY', 'LOBBY'));
    },
    onLockSession: () => {
      console.log('TODO LOCKSESSION');
      dispatch(toCard('REMOTE_PLAY', 'LOBBY'));
    },
  };
}

const RemotePlayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RemotePlay);

export default RemotePlayContainer
