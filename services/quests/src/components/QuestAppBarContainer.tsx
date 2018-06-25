import {defaultContext} from 'app/components/views/quest/cardtemplates/Template';
import {connect} from 'react-redux';
import Redux from 'redux';
import {QuestActionType} from '../actions/ActionTypes';
import {renderAndPlay, setLine} from '../actions/Editor';
import {publishQuestSetup, saveQuest, unpublishQuest} from '../actions/Quest';
import {logoutUser} from '../actions/User';
import {AnnotationType, AppState, EditorState, QuestType, UserState} from '../reducers/StateTypes';
import QuestAppBar, {QuestAppBarDispatchProps, QuestAppBarStateProps} from './QuestAppBar';

import {DOCS_INDEX_URL} from '../Constants';

const math = require('mathjs') as any;
const ReactGA = require('react-ga') as any;

const mapStateToProps = (state: AppState, ownProps: any): QuestAppBarStateProps => {
  const scope = (state.preview.quest && state.preview.quest.node && state.preview.quest.node.ctx && state.preview.quest.node.ctx.scope) || {};
  return {
    annotations: [...state.annotations.spellcheck, ...state.annotations.playtest],
    editor: state.editor,
    quest: state.quest,
    user: state.user,
    scope,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestAppBarDispatchProps => {
  return {
    onMenuSelect: (action: QuestActionType, quest: QuestType) => {
      ReactGA.event({
        category: 'interaction',
        action,
        label: 'appbar',
      });
      switch (action) {
        case 'SAVE_QUEST':
          return dispatch(saveQuest(quest));
        case 'NEW_QUEST':
          window.open('/#');
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
        default:
          throw new Error('Could not handle menu action ' + action);
      }
    },
    onUserDialogRequest: (user: UserState) => {
      dispatch(logoutUser());
    },
    onViewError: (annotations: AnnotationType[], editor: EditorState) => {
      // Jump to the next error below the current line, looping back to the top error
      const errors = annotations.filter((annotation) => annotation.type === 'error')
          .sort((a, b) => a.row - b.row);
      const errorsAfterCursor = errors.filter((error) => error.row > editor.line.number) || [];
      const errorLine = (errorsAfterCursor.length > 0) ? errorsAfterCursor[0].row : errors[0].row;
      dispatch(setLine(errorLine));
    },
    playFromCursor: (baseScope: any, editor: EditorState, quest: QuestType) => {
      const ctx = defaultContext();
      Object.assign(ctx.scope, baseScope);
      try {
        math.eval(editor.opInit, ctx.scope);
      } catch (e) {
        // TODO: Display eval errors
        console.log(e);
      }
      dispatch(renderAndPlay(quest, quest.mdRealtime.getText(), editor.line.number, editor.worker, ctx));
    },
  };
};

const QuestAppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestAppBar);

export default QuestAppBarContainer;
