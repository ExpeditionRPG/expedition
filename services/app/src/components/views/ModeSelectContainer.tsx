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
    multitouch: state.settings.multitouch,
    numPlayers: state.settings.numPlayers,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onDelta: (numPlayers: number, delta: number) => {
      numPlayers += delta;
      if (numPlayers <= 1 || numPlayers > 6) {
        return;
      }
      dispatch(changeSettings({numPlayers}));
    },
    onLocalSelect: () => {
      dispatch(changeSettings({multitouch: false}));
      dispatch(toNavCard({}));
    },
    onMultiplayerSelect(user: UserState): void {
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
