import Redux from 'redux'
import {connect} from 'react-redux'
import {AppState} from '../reducers/StateTypes'
import ContextEditor, {ContextEditorDispatchProps, ContextEditorStateProps} from './ContextEditor'
import {setOpInit} from '../actions/editor'

var math = require('mathjs') as any;

const mapStateToProps = (state: AppState, ownProps: any): ContextEditorStateProps => {
  var scopeHistory: any[] = [];

  for (var i = 0; i < state.preview._history.length; i++) {
    var pastQuest = state.preview._history[i].quest;
    if (pastQuest && pastQuest.result && pastQuest.result.ctx && pastQuest.result.ctx.scope) {
      scopeHistory.push(pastQuest.result.ctx.scope);
    }
  }

  if (state.preview.quest && state.preview.quest.result && state.preview.quest.result.ctx && state.preview.quest.result.ctx.scope) {
    scopeHistory.push(state.preview.quest.result.ctx.scope);
  }

  return {
    scopeHistory: scopeHistory,
    opInit: state.editor.opInit || '',
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): ContextEditorDispatchProps => {
  return {
    onInitialContext: (opInit: string) => {
      dispatch(setOpInit(opInit));
    }
  };
}

const ContextEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextEditor);

export default ContextEditorContainer;