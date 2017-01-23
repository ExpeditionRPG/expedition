import {connect} from 'react-redux'
import {setDirty, setLine, setDirtyTimeout} from '../actions/editor'
import {saveQuest} from '../actions/quest'
import {AppState, QuestType, EditorState} from '../reducers/StateTypes'
import QuestIDE, {QuestIDEStateProps, QuestIDEDispatchProps} from './QuestIDE'
import {store} from '../store'

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
      }

      if (editor.dirtyTimeout) {
        clearTimeout(editor.dirtyTimeout);
      }

      const timer = setTimeout(function() {
        // Check the store directly to see if we're still in a dirty state.
        // The user could have saved manually before the timeout has elapsed.
        if (store.getState().editor.dirty) {
          dispatch(saveQuest(quest));
        }
        dispatch(setDirtyTimeout(null));
      }, 2000);
      dispatch(setDirtyTimeout(timer));
    },
    onLine: (line: number, editor: EditorState) => {
      dispatch(setLine(line));
    },
  };
}

const QuestIDEContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestIDE);

export default QuestIDEContainer
