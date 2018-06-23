import Redux from 'redux'
import {connect} from 'react-redux'
import {AppState} from '../reducers/StateTypes'
import ContextEditor, {ContextEditorDispatchProps, ContextEditorStateProps} from './ContextEditor'
import {setOpInit} from '../actions/Editor'

const mapStateToProps = (state: AppState, ownProps: any): ContextEditorStateProps => {
  const scopeHistory: any[] = [];

  for (let i = 0; i < state.preview._history.length; i++) {
    const pastQuest = state.preview._history[i].quest;
    if (pastQuest && pastQuest.node && pastQuest.node.ctx && pastQuest.node.ctx.scope) {
      scopeHistory.push(pastQuest.node.ctx.scope);
    }
  }

  if (state.preview.quest && state.preview.quest.node && state.preview.quest.node.ctx && state.preview.quest.node.ctx.scope) {
    scopeHistory.push(state.preview.quest.node.ctx.scope);
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
    },
  };
}

const ContextEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextEditor);

export default ContextEditorContainer;
