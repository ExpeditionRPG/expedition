import {connect} from 'react-redux';
import Redux from 'redux';
import {SessionID} from 'shared/multiplayer/Session';
import {toCard} from '../../actions/Card';
import {multiplayerConnect, multiplayerNewSession} from '../../actions/Multiplayer';
import {openSnackbar} from '../../actions/Snackbar';
import {logEvent} from '../../Logging';
import {AppState, UserState} from '../../reducers/StateTypes';
import Multiplayer, {MIN_SECRET_LENGTH, MultiplayerDispatchProps, MultiplayerStateProps} from './Multiplayer';

const mapStateToProps = (state: AppState, ownProps: MultiplayerStateProps): MultiplayerStateProps => {
  return {
    multiplayer: state.multiplayer,
    phase: ownProps.phase,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MultiplayerDispatchProps => {
  return {
    onConnect: (user: UserState) => {
      const secret = window.prompt(`Enter the session's ${MIN_SECRET_LENGTH} character code to join.`);
      if (secret === null || secret.length !== MIN_SECRET_LENGTH) {
        return dispatch(openSnackbar(`Please enter the full session code (${MIN_SECRET_LENGTH} characters)`));
      }
      return dispatch(multiplayerConnect(user, secret.toUpperCase()));
    },
    onContinue: () => {
      logEvent('MULTIPLAYER_session_start', {});
      dispatch(toCard({name: 'FEATURED_QUESTS'}));
    },
    onNewSessionRequest: (user: UserState) => {
      return dispatch(multiplayerNewSession(user));
    },
    onReconnect: (user: UserState, id: SessionID, secret: string) => {
      dispatch(multiplayerConnect(user, secret.toUpperCase()));
    },
  };
};

const MultiplayerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Multiplayer);

export default MultiplayerContainer;
