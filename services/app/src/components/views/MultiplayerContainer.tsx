import Redux from 'redux'
import {connect} from 'react-redux'
import {toCard} from '../../actions/Card'
import {AppState, UserState} from '../../reducers/StateTypes'
import {openSnackbar} from '../../actions/Snackbar'
import {multiplayerConnect, multiplayerNewSession} from '../../actions/Multiplayer'
import Multiplayer, {MultiplayerStateProps, MultiplayerDispatchProps, MIN_SECRET_LENGTH} from './Multiplayer'
import {SessionID} from '@expedition-qdl/multiplayer/Session'
import {logEvent} from '../../Logging'

const mapStateToProps = (state: AppState, ownProps: MultiplayerStateProps): MultiplayerStateProps => {
  return {
    phase: ownProps.phase,
    user: state.user,
    multiplayer: state.multiplayer,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MultiplayerDispatchProps => {
  return {
    onConnect: (user: UserState) => {
      const secret = window.prompt(`Enter the session's ${MIN_SECRET_LENGTH} character code to join.`);
      if (secret === null || secret.length !== MIN_SECRET_LENGTH) {
        return dispatch(openSnackbar(`Please enter the full session code (${MIN_SECRET_LENGTH} characters)`));
      }
      return dispatch(multiplayerConnect(user, secret.toUpperCase()));
    },
    onReconnect: (user: UserState, id: SessionID, secret: string) => {
      dispatch(multiplayerConnect(user, secret.toUpperCase()));
    },
    onNewSessionRequest: (user: UserState) => {
      return dispatch(multiplayerNewSession(user));
    },
    onContinue: () => {
      logEvent('MULTIPLAYER_session_start', {});
      dispatch(toCard({name: 'FEATURED_QUESTS'}));
    },
  };
}

const MultiplayerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Multiplayer);

export default MultiplayerContainer
