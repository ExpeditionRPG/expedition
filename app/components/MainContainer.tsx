import Redux from 'redux'
import {connect} from 'react-redux'
import {setSnackbar} from '../actions/Snackbar'
import {AppState} from '../reducers/StateTypes'
import Main, {MainStateProps, MainDispatchProps} from './Main'

const mapStateToProps = (state: AppState, ownProps: any): MainStateProps => {
  return {
    loggedIn: state.user.loggedIn,
    snackbar: state.snackbar,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MainDispatchProps => {
  return {
    onSnackbarClose: () => {
      dispatch(setSnackbar(false));
    }
  };
}

const MainContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);

export default MainContainer
