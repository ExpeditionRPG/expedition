import {connect} from 'react-redux';
import Redux from 'redux';
import {setOpInit} from '../actions/Editor';
import {AppState} from '../reducers/StateTypes';
import ContextEditor, {ContextEditorDispatchProps, ContextEditorStateProps} from './ContextEditor';

const mapStateToProps = (state: AppState, ownProps: any): ContextEditorStateProps => {
  const scopeHistory: any[] = [];

  for (const pastState of state.preview._history) {
    const pastQuest = pastState.quest;
    if (pastQuest && pastQuest.node && pastQuest.node.ctx && pastQuest.node.ctx.scope) {
      scopeHistory.push(pastQuest.node.ctx.scope);
    }
  }

  if (state.preview.quest && state.preview.quest.node && state.preview.quest.node.ctx && state.preview.quest.node.ctx.scope) {
    scopeHistory.push(state.preview.quest.node.ctx.scope);
  }

  return {
    opInit: state.editor.opInit || '',
    scopeHistory,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): ContextEditorDispatchProps => {
  return {
    onInitialContext: (opInit: string) => {
      dispatch(setOpInit(opInit));
    },
  };
};

const ContextEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextEditor);

export default ContextEditorContainer;
