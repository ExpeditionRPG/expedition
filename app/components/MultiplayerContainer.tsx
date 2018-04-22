import Redux from 'redux'
import {connect} from 'react-redux'
import {toCard} from '../actions/Card'
import {AppState, UserState} from '../reducers/StateTypes'
import {openSnackbar} from '../actions/Snackbar'
import {remotePlayConnect, remotePlayNewSession} from '../actions/Multiplayer'
import Multiplayer, {MultiplayerStateProps, MultiplayerDispatchProps} from './Multiplayer'
import {SessionID} from 'expedition-qdl/lib/multiplayer/Session'

const mapStateToProps = (state: AppState, ownProps: MultiplayerStateProps): MultiplayerStateProps => {
  return {
    phase: ownProps.phase,
    user: state.user,
    remotePlay: state.remotePlay,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MultiplayerDispatchProps => {
  return {
    onConnect: (user: UserState) => {
      const secret = window.prompt('Enter the session\'s 4 character code to join.');
      if (secret === null || secret.length !== 4) {
        return dispatch(openSnackbar('Please enter the full session code (4 characters)'));
      }
      return dispatch(remotePlayConnect(user, secret.toUpperCase()));
    },
    onReconnect: (user: UserState, id: SessionID, secret: string) => {
      dispatch(remotePlayConnect(user, secret.toUpperCase()));
    },
    onNewSessionRequest: (user: UserState) => {
      return dispatch(remotePlayNewSession(user));
    },
    onContinue: () => {
      dispatch(toCard({name: 'FEATURED_QUESTS'}));
    },
  };
}

const MultiplayerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Multiplayer);

export default MultiplayerContainer
