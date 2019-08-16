import {connect} from 'react-redux';
import Redux from 'redux';
import {toNavCard} from '../../actions/Card';
import {changeSettings, getContentSets} from '../../actions/Settings';
import {logEvent} from '../../Logging';
import {AppState} from '../../reducers/StateTypes';
import MultiplayerLobby, {DispatchProps, StateProps} from './MultiplayerLobby';

const mapStateToProps = (state: AppState, ownProps: Partial<StateProps>): StateProps => {
  return {
    multiplayer: state.multiplayer,
    settings: state.settings,
    contentSets: getContentSets(state.settings, state.multiplayer),
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onPlayerChange: (numLocalPlayers: number) => {
      dispatch(changeSettings({numLocalPlayers}));
    },
    onStart: () => {
      logEvent('multiplayer', 'session_start', {});
      dispatch(toNavCard({}));

      // Prevent us from going back
      dispatch({type: 'CLEAR_HISTORY'});
    },
  };
};

const MultiplayerLobbyContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiplayerLobby);

export default MultiplayerLobbyContainer;
