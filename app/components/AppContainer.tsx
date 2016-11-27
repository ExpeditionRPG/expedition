import {connect} from 'react-redux'
import {blockChange} from '../actions/quest'
import {AppState, EditorState} from '../reducers/StateTypes'
import App, {AppDispatchProps, AppStateProps} from './App'

const mapStateToProps = (state: AppState, ownProps: any): AppStateProps => {
  return {
    editor: state.editor,
  };
}


const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AppDispatchProps => {
  return {
    doPreview: (editor: EditorState) => {
      dispatch(blockChange(editor.renderer, editor.line));
    },
  };
}

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;