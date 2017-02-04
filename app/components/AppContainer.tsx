import {connect} from 'react-redux'
import {AppState, EditorState, QuestType} from '../reducers/StateTypes'
import App, {AppDispatchProps, AppStateProps} from './App'
import {QDLParser, renderXML} from '../parsing/QDLParser'

import {initQuest, loadNode} from 'expedition-app/app/actions/quest'
import {loadQuestXML} from 'expedition-app/app/actions/web'
import {toCard} from 'expedition-app/app/actions/card'
import {defaultQuestContext} from 'expedition-app/app/reducers/QuestTypes'

var math = require('mathjs') as any;

const mapStateToProps = (state: AppState, ownProps: any): AppStateProps => {
  var scope = (state.preview.quest && state.preview.quest.result && state.preview.quest.result.ctx && state.preview.quest.result.ctx.scope) || {};
  return {
    editor: state.editor,
    quest: state.quest,
    scope: scope,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AppDispatchProps => {
  return {
    playFromCursor: (baseScope: any, editor: EditorState, quest: QuestType) => {
      var renderResult = renderXML(quest.mdRealtime.getText())
      var newNode = renderResult.getResultAt(editor.line);
      var tag = newNode.get(0).tagName;
      if (tag !== 'roleplay' && tag !== 'combat') {
        alert("Invalid cursor position; to play from the cursor, cursor must be on a roleplaying or combat card.");
        return;
      }

      var ctx = defaultQuestContext();
      Object.assign(ctx.scope, baseScope);
      try {
        math.eval(editor.opInit, ctx.scope);
      } catch(e) {
        // TODO: Display eval errors
        console.log(e);
      }
      
      dispatch({type: 'REBOOT_APP'});
      dispatch(initQuest(renderResult.getResult().children().eq(0), defaultQuestContext()));
      // TODO: Make these settings configurable
      loadNode({numPlayers: 1, difficulty: "NORMAL", showHelp: true, multitouch: false}, dispatch, newNode, ctx);
    },
  };
}

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;
