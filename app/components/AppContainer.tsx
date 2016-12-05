import {connect} from 'react-redux'
import {AppState, EditorState, QuestType} from '../reducers/StateTypes'
import App, {AppDispatchProps, AppStateProps} from './App'
import {QDLParser, renderXML} from '../parsing/QDLParser'
import {setDialog} from '../actions/dialogs'
import {setPlaySetting} from '../actions/editor'

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

var math = require('mathjs') as any;

function playFromCursor(dispatch: Redux.Dispatch<any>, editor: EditorState, quest: QuestType) {
  var newNode = renderXML(quest.mdRealtime.getText()).getResultAt(editor.line);
  var tag = newNode.get(0).tagName;
  if (tag === 'roleplay' || tag === 'combat') {
    dispatch({type: 'REBOOT_APP'});
    dispatch(toCard('QUEST_START'));

    var ctx = defaultQuestContext();
    math.eval(editor.opInit, ctx.scope);

    loadNode({numPlayers: 1, difficulty: "NORMAL", showHelp: true, multitouch: false}, dispatch, newNode, ctx);
  }
}

function playFromStart(dispatch: Redux.Dispatch<any>, editor: EditorState, quest: QuestType) {
  dispatch({type: 'REBOOT_APP'});
  var ctx = defaultQuestContext();
  math.eval(editor.opInit, ctx.scope);
  dispatch(initQuest(renderXML(quest.mdRealtime.getText()).getResult().children().eq(0), ctx));
  dispatch(toCard('QUEST_START'));
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AppDispatchProps => {
  return {
    onPlay: (editor: EditorState, quest: QuestType) => {
      switch (editor.playFrom) {
        case 'cursor':
          return playFromCursor(dispatch, editor, quest);
        case 'start':
          return playFromStart(dispatch, editor, quest);
        default:
          throw new Error("Unknown playFrom setting");
      }
    },
    openInitialStateDialog: () => {
      dispatch(setDialog('INITIAL_STATE', true));
    },
    onPlaySettingChange: (e: any, index: number, menuItemValue: any) => {
      dispatch(setPlaySetting(menuItemValue as string));
    }
  };
}

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;