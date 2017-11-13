import Redux from 'redux'
import {connect} from 'react-redux'
import {setLine, updateDirtyState} from '../actions/Editor'
import {saveQuest} from '../actions/Quest'
import {AppState, QuestType, EditorState} from '../reducers/StateTypes'
import QuestIDE, {QuestIDEStateProps, QuestIDEDispatchProps} from './QuestIDE'
import {setDialog} from '../actions/Dialogs'

const mapStateToProps = (state: AppState, ownProps: any): QuestIDEStateProps => {
  return {
    annotations: [...state.annotations.spellcheck, ...state.annotations.playtest],
    lastSplitPaneDragMillis: state.editor.lastSplitPaneDragMillis,
    line: state.editor.line.number,
    lineTs: state.editor.line.ts,
    realtime: state.quest.mdRealtime,
    realtimeModel: state.quest.realtimeModel,
    showLineNumbers: state.editor.showLineNumbers,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestIDEDispatchProps => {
  return {
    onDirty: (realtime: any, text: string) => {
      realtime.setText(text);
      dispatch(updateDirtyState());
    },
    onLine: (line: number) => {
      dispatch(setLine(line));
    },
    onAnnotationClick: (annotations: number[]) => {
      dispatch(setDialog('ANNOTATION_DETAIL', true, annotations));
    }
  };
}

const QuestIDEContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestIDE);

export default QuestIDEContainer
