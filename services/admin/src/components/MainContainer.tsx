import {connect} from 'react-redux';
import Redux from 'redux';
import {setSnackbar} from '../actions/Snackbar';
import {setView} from '../actions/View';
import {AppState, ViewType} from '../reducers/StateTypes';
import Main, {MainDispatchProps, MainStateProps} from './Main';

const mapStateToProps = (state: AppState, ownProps: any): MainStateProps => {
  return {
    loggedIn: state.user.loggedIn,
    snackbar: state.snackbar,
    view: state.view.view,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MainDispatchProps => {
  return {
    onSnackbarClose: () => {
      dispatch(setSnackbar(false));
    },
    onViewChange: (view: ViewType) => {
      dispatch(setView(view));
    },
  };
};

const MainContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);

export default MainContainer;
