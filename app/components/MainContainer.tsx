import Redux from 'redux'
import {connect} from 'react-redux'
import {setSnackbar} from '../actions/Snackbar'
import {toggleDrawer} from '../actions/Dialogs'
import {setView} from '../actions/View'
import {AppState, ViewType} from '../reducers/StateTypes'
import Main, {MainStateProps, MainDispatchProps} from './Main'

const mapStateToProps = (state: AppState, ownProps: any): MainStateProps => {
  return {
    loggedIn: state.user.loggedIn,
    snackbar: state.snackbar,
    drawer: state.dialogs.drawer,
    view: state.view.view,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MainDispatchProps => {
  return {
    onSnackbarClose: () => {
      dispatch(setSnackbar(false));
    },
    onDrawerClose: () => {
      dispatch(toggleDrawer());
    },
    onViewChange: (view: ViewType) => {
      dispatch(setView(view));
      dispatch(toggleDrawer());
    }
  };
}

const MainContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);

export default MainContainer
