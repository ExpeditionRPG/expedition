import {connect} from 'react-redux';
import Redux from 'redux';
import {toNavCard} from '../../actions/Card';
import {loadMultiplayer} from '../../actions/Multiplayer';
import {changeSettings} from '../../actions/Settings';
import {ensureLogin} from '../../actions/User';
import {AppState, UserState} from '../../reducers/StateTypes';
import ModeSelect, {DispatchProps, StateProps} from './ModeSelect';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    isLatestAppVersion: state.serverstatus.isLatestAppVersion,
    settings: state.settings,
    user: state.user,
    multiplayer: state.multiplayer,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onPlayerChange: (numLocalPlayers: number) => {
      dispatch(changeSettings({numLocalPlayers}));
    },
    onLocalSelect: () => {
      dispatch(changeSettings({multitouch: false}));
      dispatch(toNavCard({}));
    },
    onMultiplayerSelect: (user: UserState) => {
      dispatch(ensureLogin())
        .then((u: UserState) => {
          dispatch(loadMultiplayer(u));
        });
    },
    onMultitouchChange: (v: boolean) => {
      dispatch(changeSettings({multitouch: v}));
    },
  };
};

const ModeSelectContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ModeSelect);

export default ModeSelectContainer;
