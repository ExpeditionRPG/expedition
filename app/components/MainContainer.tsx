import Redux from 'redux'
import {connect} from 'react-redux'
import {setDirty, panelToggle} from '../actions/editor'
import {AppState, PanelType} from '../reducers/StateTypes'
import Main, {MainStateProps, MainDispatchProps} from './Main'

const mapStateToProps = (state: AppState, ownProps: any): MainStateProps => {
  return {
    loggedIn: state.user.loggedIn,
    bottomPanel: state.editor.bottomPanel,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MainDispatchProps => {
  return {
    onDragFinished: (size: number) => {
      dispatch({type: 'PANEL_DRAG'});
    },
    onPanelToggle: (panel: PanelType) => {
      dispatch(panelToggle(panel));
    }
  };
}

const MainContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);

export default MainContainer
