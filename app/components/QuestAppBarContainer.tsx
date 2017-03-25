import Redux from 'redux'
import {connect} from 'react-redux'

import {QuestActionType} from '../actions/ActionTypes'
import {saveQuest, publishQuest, unpublishQuest} from '../actions/quest'
import {logoutUser} from '../actions/user'
import {AppState, QuestType, EditorState, UserState} from '../reducers/StateTypes'
import QuestAppBar, {QuestAppBarStateProps, QuestAppBarDispatchProps} from './QuestAppBar'

import {renderXML} from '../parsing/QDLParser'

import {initQuest, loadNode} from 'expedition-app/app/actions/quest'
import {loadQuestXML} from 'expedition-app/app/actions/web'
import {toCard} from 'expedition-app/app/actions/card'
import {defaultQuestContext} from 'expedition-app/app/reducers/QuestTypes'

import {DOCS_INDEX_URL, DEV_CONTACT_URL} from '../constants'

declare var ga: any;

var math = require('mathjs') as any;

const mapStateToProps = (state: AppState, ownProps: any): QuestAppBarStateProps => {
  var scope = (state.preview.quest && state.preview.quest.result && state.preview.quest.result.ctx && state.preview.quest.result.ctx.scope) || {};
  return {
    annotations: state.annotations,
    editor: state.editor,
    quest: state.quest,
    user: state.user,
    scope: scope,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestAppBarDispatchProps => {
  return {
    onMenuSelect: (action: QuestActionType, quest: QuestType) => {
      ga('send', 'event', 'interaction', action, 'appbar');
      switch(action) {
        case 'SAVE_QUEST':
          return dispatch(saveQuest(quest));
        case 'NEW_QUEST':
          window.open('/');
          break;
        case 'PUBLISH_QUEST':
          return dispatch(publishQuest(quest));
        case 'UNPUBLISH_QUEST':
          return dispatch(unpublishQuest(quest));
        case 'DRIVE_VIEW':
          window.open('https://drive.google.com/drive/search?q=' + quest.title);
          break;
        case 'HELP':
          window.open(DOCS_INDEX_URL, '_blank');
          break;
        case 'FEEDBACK':
          window.open(DEV_CONTACT_URL, '_blank');
          break;
        default:
          throw new Error('Could not handle menu action ' + action);
      }
    },
    onUserDialogRequest: (user: UserState) => {
      dispatch(logoutUser());
    },
    playFromCursor: (baseScope: any, editor: EditorState, quest: QuestType) => {
      var renderResult = renderXML(quest.mdRealtime.getText())
      var newNode = renderResult.getResultAt(editor.line);
      var tag = newNode.get(0).tagName;
      if (tag !== 'roleplay' && tag !== 'combat') {
        alert('Invalid cursor position; to play from the cursor, cursor must be on a roleplaying or combat card.');
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
      loadNode({numPlayers: 1, difficulty: 'NORMAL', showHelp: false, multitouch: false, vibration: false}, dispatch, newNode, ctx);
    },
  };
}

const QuestAppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestAppBar);

export default QuestAppBarContainer;
