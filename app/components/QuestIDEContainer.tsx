import {connect} from 'react-redux'
import {setDirty, setLine} from '../actions/editor'
import {saveQuest} from '../actions/quest'
import {AppState, QuestType, EditorState} from '../reducers/StateTypes'
import {pushError} from '../error'
import QuestIDE, {QuestIDEStateProps, QuestIDEDispatchProps} from './QuestIDE'

var toMarkdown: any = require('../../translation/to_markdown')

const mapStateToProps = (state: AppState, ownProps: any): QuestIDEStateProps => {
  return {
    editor: state.editor,
    realtime: state.quest.mdRealtime,
    quest: state.quest,
    annotations: state.annotations,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestIDEDispatchProps => {
  return {
    onDirty: (realtime: any, quest: QuestType, editor: EditorState, text: string) => {
      realtime.setText(text);

      if (!editor.dirty) {
        dispatch(setDirty(true));
        setTimeout(function() { dispatch(saveQuest(quest, editor)); }, 5000);
      }
    },
    onLine: (line: number, editor: EditorState) => {
      dispatch(setLine(line));
    }
  };
}

const QuestIDEContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestIDE);

export default QuestIDEContainer