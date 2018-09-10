import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../actions/Card';
import {loadMultiplayer} from '../../actions/Multiplayer';
import {changeSettings} from '../../actions/Settings';
import {ensureLogin} from '../../actions/User';
import {AppState, UserState} from '../../reducers/StateTypes';
import PartySizeSelect, {DispatchProps, StateProps} from './PartySizeSelect';

const mapStateToProps = (state: AppState): StateProps => {
  return {
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
      dispatch(toCard({name: 'FEATURED_QUESTS'}));
    },
    onMultiplayerSelect(user: UserState): void {
      dispatch(ensureLogin())
        .then((u: UserState) => {
          dispatch(loadMultiplayer(u));
        });
    },
  };
};

const PartySizeSelectContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PartySizeSelect);

export default PartySizeSelectContainer;
