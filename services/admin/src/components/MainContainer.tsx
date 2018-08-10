import {connect} from 'react-redux';
import Redux from 'redux';
import {setSnackbar} from '../actions/Snackbar';
import {setView} from '../actions/View';
import {AppState, ViewType} from '../reducers/StateTypes';
import Main, {DispatchProps, StateProps} from './Main';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    loggedIn: state.user.loggedIn,
    snackbar: state.snackbar,
    view: state.view.view,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
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
