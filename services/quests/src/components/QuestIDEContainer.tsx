import {connect} from 'react-redux';
import Redux from 'redux';
import {setDialog} from '../actions/Dialogs';
import {setLine, updateDirtyState} from '../actions/Editor';
import {AppState} from '../reducers/StateTypes';
import QuestIDE, {QuestIDEDispatchProps, QuestIDEStateProps} from './QuestIDE';

const mapStateToProps = (state: AppState, ownProps: any): QuestIDEStateProps => {
  return {
    annotations: [...state.annotations.spellcheck, ...state.annotations.playtest],
    lastSplitPaneDragMillis: state.editor.lastSplitPaneDragMillis,
    line: state.editor.line.number,
    lineTs: state.editor.line.ts,
    realtime: state.quest.mdRealtime,
    realtimeModel: state.quest.realtimeModel,
    showLineNumbers: state.editor.showLineNumbers,
    showSpellcheck: state.quest.language === 'English',
    tutorial: state.tutorial,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestIDEDispatchProps => {
  return {
    onAnnotationClick: (annotations: number[]) => {
      dispatch(setDialog('ANNOTATION_DETAIL', true, annotations));
    },
    onDirty: (realtime: any, text: string) => {
      realtime.setText(text);
      dispatch(updateDirtyState());
    },
    onLine: (line: number) => {
      dispatch(setLine(line));
    },
  };
};

const QuestIDEContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestIDE);

export default QuestIDEContainer;
