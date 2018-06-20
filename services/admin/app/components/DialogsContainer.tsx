import Redux from 'redux'
import {connect} from 'react-redux'

import {UserEntry, QuestEntry, FeedbackEntry} from '@expedition-api/app/admin/QueryTypes'
import {DialogIDType, DialogsState, AppState} from '../reducers/StateTypes'
import {setDialog} from '../actions/Dialogs'
import Dialogs, {DialogsStateProps, DialogsDispatchProps} from './Dialogs'
import {mutateUser, mutateQuest, mutateFeedback} from '../actions/Web'

const Joi = require('joi-browser');

const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  return {
    dialogs: state.dialogs,
    feedback: (state.view.selected.feedback !== null) ? state.view.feedback[state.view.selected.feedback] : null,
    quest: (state.view.selected.quest !== null) ? state.view.quests[state.view.selected.quest] : null,
    user: (state.view.selected.user !== null) ? state.view.users[state.view.selected.user] : null,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DialogsDispatchProps => {
  return {
    onClose: (dialog: DialogIDType): void => {
      switch (dialog) {
        case 'FEEDBACK_DETAILS':
          dispatch({type: 'SELECT_ROW', table: 'feedback', row: null});
          break;
        case 'QUEST_DETAILS':
          dispatch({type: 'SELECT_ROW', table: 'user', row: null});
          break;
        case 'USER_DETAILS':
          dispatch({type: 'SELECT_ROW', table: 'user', row: null});
          break;
        default:
          break;
      }
      dispatch(setDialog('NONE'));
    },
    onSetUserLootPoints: (user: UserEntry, loot_points: number) => {
      dispatch(mutateUser({userid: user.id, loot_points}));
    },
    onSetQuestPublishState: (quest: QuestEntry, published: boolean) => {
      dispatch(mutateQuest({questid: quest.id, partition: quest.partition, published}));
    },
    onSetFeedbackSuppressed: (feedback: FeedbackEntry, suppress: boolean) => {
      dispatch(mutateFeedback({partition: feedback.partition, questid: feedback.quest.id, userid: feedback.user.id, suppress}));
    }
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer
