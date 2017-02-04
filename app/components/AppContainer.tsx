import {connect} from 'react-redux'
import {AppState, EditorState, QuestType} from '../reducers/StateTypes'
import App, {AppDispatchProps, AppStateProps} from './App'
import {QDLParser, renderXML} from '../parsing/QDLParser'

import {initQuest, loadNode} from 'expedition-app/app/actions/quest'
import {loadQuestXML} from 'expedition-app/app/actions/web'
import {toCard} from 'expedition-app/app/actions/card'
import {defaultQuestContext} from 'expedition-app/app/reducers/QuestTypes'

const mapStateToProps = (state: AppState, ownProps: any): AppStateProps => {
  return {
    editor: state.editor,
    quest: state.quest,
  };
}


const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AppDispatchProps => {
  return {
    playFromCursor: (editor: EditorState, quest: QuestType) => {
      const xml = renderXML(quest.mdRealtime.getText());
      const questNode = xml.getResult();
      const targetNode = xml.getResultAt(editor.line);
      const tag = targetNode.get(0).tagName;
      if (tag === 'roleplay' || tag === 'combat') {
        dispatch({type: 'REBOOT_APP'});
        dispatch(initQuest(renderXML(quest.mdRealtime.getText()).getResult().children().eq(0), defaultQuestContext()));
        loadNode({numPlayers: 1, difficulty: "NORMAL", showHelp: false, multitouch: false}, dispatch, targetNode, defaultQuestContext());
      } else {
        alert("Invalid cursor position; to play from the cursor, cursor must be on a roleplaying or combat card.");
      }
    },
    playFromStart: (editor: EditorState, quest: QuestType) => {
      const xml = renderXML(quest.mdRealtime.getText());
      const questNode = xml.getResult();
      const targetNode = questNode.children().eq(0);
      dispatch({type: 'REBOOT_APP'});
      dispatch(initQuest(renderXML(quest.mdRealtime.getText()).getResult().children().eq(0), defaultQuestContext()));
      loadNode({numPlayers: 1, difficulty: "NORMAL", showHelp: false, multitouch: false}, dispatch, targetNode, defaultQuestContext());
    }
  };
}

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;
