import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard, toNavCard} from '../../actions/Card';
import {changeSettings} from '../../actions/Settings';
import {openWindow} from '../../Globals';
import {AppState} from '../../reducers/StateTypes';
import {AnnouncementState} from '../../reducers/StateTypes';
import SplashScreen, {DispatchProps, StateProps} from './SplashScreen';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    announcement: state.serverstatus.announcement,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onAnnouncementTap: (announcement: AnnouncementState) => {
      if (announcement.link && announcement.link !== '') {
        if (announcement.link.includes('?')) {
          openWindow(announcement.link); // appending ?utm_source to a URL with
              // a ? may break the URL
        } else {
          openWindow(announcement.link + '?utm_source=app');
        }
      }
    },
    onPlayerCountSelect: (numLocalPlayers: number) => {
      dispatch(changeSettings({numLocalPlayers, multitouch: true}));
      dispatch(toNavCard({}));
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
