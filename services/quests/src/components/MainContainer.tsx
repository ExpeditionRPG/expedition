import {connect} from 'react-redux';
import Redux from 'redux';
import {lineNumbersToggle, panelToggle} from '../actions/Editor';
import {setSnackbar} from '../actions/Snackbar';
import {AppState, PanelType} from '../reducers/StateTypes';
import Main, {MainDispatchProps, MainStateProps} from './Main';

const mapStateToProps = (state: AppState, ownProps: any): MainStateProps => {
  return {
    bottomPanel: state.editor.bottomPanel,
    editor: state.editor,
    loggedIn: state.user.loggedIn,
    quest: state.quest,
    snackbar: state.snackbar,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MainDispatchProps => {
  return {
    onDragFinished: (size: number) => {
      dispatch({type: 'PANEL_DRAG'});
    },
    onLineNumbersToggle: () => {
      dispatch(lineNumbersToggle());
    },
    onPanelToggle: (panel: PanelType) => {
      dispatch(panelToggle(panel));
    },
    onSnackbarClose: () => {
      dispatch(setSnackbar(false));
    },
  };
};

const MainContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);

export default MainContainer;
