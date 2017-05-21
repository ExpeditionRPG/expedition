import Redux from 'redux'
import {connect} from 'react-redux'

import {QuestActionType} from '../actions/ActionTypes'
import {getPlayNode} from '../actions/editor'
import {saveQuest, publishQuestSetup, unpublishQuest} from '../actions/quest'
import {logoutUser} from '../actions/user'
import {AppState, QuestType, EditorState, UserState} from '../reducers/StateTypes'
import QuestAppBar, {QuestAppBarStateProps, QuestAppBarDispatchProps} from './QuestAppBar'

import {renderXML} from '../parsing/QDLParser'

import {initQuest, loadNode} from 'expedition-app/app/actions/Quest'
import {toCard} from 'expedition-app/app/actions/Card'
import {ParserNode} from 'expedition-app/app/parser/Node'
import {defaultQuestContext} from 'expedition-app/app/reducers/QuestTypes'

import {DOCS_INDEX_URL, DEV_CONTACT_URL} from '../constants'

const math = require('mathjs') as any;
const ReactGA = require('react-ga') as any;

const mapStateToProps = (state: AppState, ownProps: any): QuestAppBarStateProps => {
  var scope = (state.preview.quest && state.preview.quest.node && state.preview.quest.node.ctx && state.preview.quest.node.ctx.scope) || {};
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
      ReactGA.event({
        category: 'interaction',
        action: action,
        label: 'appbar',
      });
      switch(action) {
        case 'SAVE_QUEST':
          return dispatch(saveQuest(quest));
        case 'NEW_QUEST':
          window.open('/');
          break;
        case 'PUBLISH_QUEST':
          return dispatch(publishQuestSetup());
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
      const renderResult = renderXML(quest.mdRealtime.getText());
      const questNode = renderResult.getResult();
      const newNode = getPlayNode(renderResult.getResultAt(editor.line));

      let ctx = defaultQuestContext();
      Object.assign(ctx.scope, baseScope);
      try {
        math.eval(editor.opInit, ctx.scope);
      } catch(e) {
        // TODO: Display eval errors
        console.log(e);
      }

      dispatch({type: 'REBOOT_APP'});
      const result = dispatch(initQuest('0', questNode, ctx));
      // TODO: Make these settings configurable - https://github.com/ExpeditionRPG/expedition-quest-creator/issues/261
      loadNode({autoRoll: false, numPlayers: 1, difficulty: 'NORMAL', showHelp: false, multitouch: false, vibration: false}, dispatch, new ParserNode(newNode, ctx));
    },
  };
}

const QuestAppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestAppBar);

export default QuestAppBarContainer;
