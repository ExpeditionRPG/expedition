import {connect} from 'react-redux'

import {QuestActionType} from '../actions/ActionTypes'
import {saveQuest, publishQuest, unpublishQuest} from '../actions/quest'
import {logoutUser} from '../actions/user'
import {AppState, DirtyState, QuestType, UserState} from '../reducers/StateTypes'
import QuestAppBar, {QuestAppBarStateProps, QuestAppBarDispatchProps} from './QuestAppBar'

import {MARKDOWN_GUIDE_URL} from '../constants'


const mapStateToProps = (state: AppState, ownProps: any): QuestAppBarStateProps => {
  return {
    dirty: state.dirty,
    quest: state.quest,
    user: state.user,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestAppBarDispatchProps => {
  return {
    onMenuSelect: (action: QuestActionType, dirty: DirtyState, quest: QuestType) => {
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
          window.open(MARKDOWN_GUIDE_URL, '_blank');
          break;
        case 'FEEDBACK':
          window.open("http://expeditiongame.com/contact");
          break;
        default:
          throw new Error("Could not handle menu action " + action);
      }
    },
    onUserDialogRequest: (user: UserState) => {
      dispatch(logoutUser());
    },
  };
}

const QuestAppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestAppBar);

export default QuestAppBarContainer;