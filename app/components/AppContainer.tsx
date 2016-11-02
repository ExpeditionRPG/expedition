import {connect} from 'react-redux'
import {loginUser} from '../actions/user'
import {AppState, UserState} from '../reducers/StateTypes'
import App, {AppDispatchProps} from './App'

const mapStateToProps = (state: AppState, ownProps: any): any => {
  return {};
}


const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AppDispatchProps => {
  return {
    onLogin: (user: UserState) => {
      dispatch(loginUser(true));
    },
  };
}

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;