import Redux from 'redux'
import {connect} from 'react-redux'
import {AppState} from '../../reducers/StateTypes'
import {changeSettings} from '../../actions/Settings'
import {toCard} from '../../actions/Card'
import {AnnouncementState} from '../../reducers/StateTypes'
import SplashScreen, {SplashScreenStateProps, SplashScreenDispatchProps} from './SplashScreen'
import {openWindow} from '../../Globals'

const mapStateToProps = (state: AppState, ownProps: any): SplashScreenStateProps => {
  return {
    announcement: state.announcement,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SplashScreenDispatchProps => {
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
    }
  };
}

const SplashScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SplashScreen);

export default SplashScreenContainer
