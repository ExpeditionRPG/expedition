import Redux from 'redux'
import { connect } from 'react-redux'
import {AppState} from '../reducers/StateTypes'
import {changeSettings} from '../actions/Settings'
import {toCardBase} from '../actions/Card'
import {AnnouncementState} from '../reducers/StateTypes'
import SplashScreen, {SplashScreenStateProps, SplashScreenDispatchProps} from './SplashScreen'

declare var window:any;

const mapStateToProps = (state: AppState, ownProps: any): SplashScreenStateProps => {
  return {
    announcement: state.announcement,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SplashScreenDispatchProps => {
  return {
    onAnnouncementTap: (announcement: AnnouncementState) => {
      if (announcement.link !== '') {
        window.open(announcement.link + '?utm_source=app', '_system');
      }
    },
    onPlayerCountSelect: (numPlayers: number) => {
      dispatch(changeSettings({numPlayers, multitouch: true}));
      dispatch(toCardBase({name: 'FEATURED_QUESTS'}));
    },
    onPlayerManualSelect: () => {
      dispatch(toCardBase({name: 'PLAYER_COUNT_SETTING'}));
    }
  };
}

const SplashScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SplashScreen);

export default SplashScreenContainer
