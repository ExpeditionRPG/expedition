import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../actions/Card';
import {changeSettings} from '../../actions/Settings';
import {openWindow} from '../../Globals';
import {AppState} from '../../reducers/StateTypes';
import {AnnouncementState} from '../../reducers/StateTypes';
import SplashScreen, {DispatchProps, StateProps} from './SplashScreen';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    announcement: state.announcement,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onAnnouncementTap: (announcement: AnnouncementState) => {
      if (announcement.link !== '') {
        openWindow(announcement.link + '?utm_source=app');
      }
    },
    onPlayerCountSelect: (numPlayers: number) => {
      dispatch(changeSettings({numPlayers, multitouch: true}));
      dispatch(toCard({name: 'FEATURED_QUESTS'}));
    },
    onPlayerManualSelect: () => {
      dispatch(toCard({name: 'PLAYER_COUNT_SETTING'}));
    },
  };
};

const SplashScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SplashScreen);

export default SplashScreenContainer;
