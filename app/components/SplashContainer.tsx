import { connect } from 'react-redux'
import { loginUser } from '../actions/user'
import {AppState, UserState} from '../reducers/StateTypes'
import Splash, { SplashDispatchProps } from './Splash'

const mapStateToProps = (state: AppState, ownProps: any): any => {
  return {user: state.user};
}


const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SplashDispatchProps => {
  return {
    onLogin: (user: UserState) => {
      dispatch(loginUser());
    },
  };
}

const SplashContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Splash);

export default SplashContainer;