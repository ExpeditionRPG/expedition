import {PropTypes} from 'react'
import {connect} from 'react-redux'
import {QuestActionType} from '../actions/ActionTypes'
import {showHelp} from '../actions/dialogs'
import {setDrawer} from '../actions/drawer'
import {saveQuest, publishQuest, unpublishQuest} from '../actions/quest'
import {DirtyState, QuestType, AppState} from '../reducers/StateTypes'
import QuestDrawer, {QuestDrawerStateProps, QuestDrawerDispatchProps} from './QuestDrawer'

const mapStateToProps = (state: AppState, ownProps: any): QuestDrawerStateProps => {
  return {
    quest: state.quest,
    drawer: state.drawer,
    dirty: state.dirty,
    user: state.user
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestDrawerDispatchProps => {
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
          // TODO: Actually search for this quest's title (scrape from load)
          window.open('https://drive.google.com/drive/search?q=Expedition');
          break;
        default:
          throw new Error("Could not handle menu action " + action);
      }
    },
    onDrawerRequestChange: () => {
      dispatch(setDrawer("", false));
    },
    onHelpRequest: () => {
      dispatch(showHelp());
    },
  };
}

const QuestDrawerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestDrawer);

export default QuestDrawerContainer