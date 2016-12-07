import {connect} from 'react-redux'
import {AppState, ConsoleHistory} from '../reducers/StateTypes'
import ContextEditor, {ContextEditorDispatchProps, ContextEditorStateProps} from './ContextEditor'
import {setConsoleHistory} from '../actions/editor'

var math = require('mathjs') as any;

const mapStateToProps = (state: AppState, ownProps: any): ContextEditorStateProps => {
  var scope = (state.preview.quest && state.preview.quest.result && state.preview.quest.result.ctx && state.preview.quest.result.ctx.scope) || {};
  return {
    scope,
    history: state.editor.consoleHistory || [],
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): ContextEditorDispatchProps => {
  return {
    onCommand: (history: ConsoleHistory, command: string, result: string) => {
      var newHistory = history.slice();
      newHistory.push({command, result});
      dispatch(setConsoleHistory(newHistory));
    }
  };
}

const ContextEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextEditor);

export default ContextEditorContainer;