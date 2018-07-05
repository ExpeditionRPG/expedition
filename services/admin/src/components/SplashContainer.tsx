import {connect} from 'react-redux';
import Redux from 'redux';
import {login} from '../actions/User';
import {AppState, UserState} from '../reducers/StateTypes';
import Splash, {SplashDispatchProps} from './Splash';

const ReactGA = require('react-ga') as any;

const mapStateToProps = (state: AppState, ownProps: any): any => {
  return {user: state.user};
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SplashDispatchProps => {
  return {
    onLogin: (position: string) => {
      ReactGA.event({
        action: 'LOGIN',
        category: 'interaction',
        label: 'splashscreen' + position,
      });
      dispatch(login((user: UserState) => {
        console.error('TODO');
      }));
    },
  };
};

const SplashContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Splash);

export default SplashContainer;
