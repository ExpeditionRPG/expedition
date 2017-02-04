import {connect} from 'react-redux'
import {AppState, EditorState, QuestType} from '../reducers/StateTypes'
import App, {AppDispatchProps, AppStateProps} from './App'

const mapStateToProps = (state: AppState, ownProps: any): AppStateProps => {
  var scope = (state.preview.quest && state.preview.quest.result && state.preview.quest.result.ctx && state.preview.quest.result.ctx.scope) || {};
  return {
    editor: state.editor,
    quest: state.quest,
    scope: scope,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AppDispatchProps => {
  return {};
}

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;
