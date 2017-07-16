import Redux from 'redux'
import {connect} from 'react-redux'
import {setLine, updateDirtyState} from '../actions/Editor'
import {saveQuest} from '../actions/Quest'
import {AppState, QuestType, EditorState} from '../reducers/StateTypes'
import QuestIDE, {QuestIDEStateProps, QuestIDEDispatchProps} from './QuestIDE'

const mapStateToProps = (state: AppState, ownProps: any): QuestIDEStateProps => {
  return {
    realtime: state.quest.mdRealtime,
    realtimeModel: state.quest.realtimeModel,
    annotations: state.annotations,
    lastSplitPaneDragMillis: state.editor.lastSplitPaneDragMillis,
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
  };
}

const QuestIDEContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestIDE);

export default QuestIDEContainer
