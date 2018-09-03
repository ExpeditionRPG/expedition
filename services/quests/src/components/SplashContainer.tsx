import {connect} from 'react-redux';
import Redux from 'redux';
import {loadQuestFromURL} from '../actions/Quest';
import {loginUser} from '../actions/User';
import {AppState, UserState} from '../reducers/StateTypes';
import Splash, {DispatchProps, StateProps} from './Splash';

const ReactGA = require('react-ga');

const mapStateToProps = (state: AppState): StateProps => {
  return {user: state.user};
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onLogin: (position: string) => {
      ReactGA.event({
        action: 'LOGIN',
        category: 'interaction',
        label: 'splashscreen' + position,
      });
      dispatch(loginUser(true, true));
    },
    onNewQuest: (user: UserState) => {
      dispatch(loadQuestFromURL(user));
    },
  };
};

const SplashContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Splash);

export default SplashContainer;
