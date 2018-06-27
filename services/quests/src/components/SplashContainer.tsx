import Redux from 'redux'
import {connect} from 'react-redux'
import Splash, {SplashDispatchProps} from './Splash'
import {loadQuestFromURL} from '../actions/Quest'
import {loginUser} from '../actions/User'
import {AppState, UserState} from '../reducers/StateTypes'

const ReactGA = require('react-ga') as any;

const mapStateToProps = (state: AppState, ownProps: any): any => {
  return {user: state.user};
}


const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SplashDispatchProps => {
  return {
    onLogin: (position: string) => {
      ReactGA.event({
        category: 'interaction',
        action: 'LOGIN',
        label: 'splashscreen' + position,
      });
      dispatch(loginUser(true, true));
    },
    onNewQuest: (user: UserState) => {
      dispatch(loadQuestFromURL(user));
    },
  };
}

const SplashContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Splash);

export default SplashContainer;
