import {connect} from 'react-redux';
import Redux from 'redux';

import {FeedbackEntry, QuestEntry, UserEntry} from 'api/admin/QueryTypes';
import {setDialog} from '../actions/Dialogs';
import {mutateFeedback, mutateQuest, mutateUser} from '../actions/Web';
import {AppState, DialogIDType} from '../reducers/StateTypes';
import Dialogs, {DialogsDispatchProps, DialogsStateProps} from './Dialogs';

const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  return {
    dialogs: state.dialogs,
    feedback: (state.view.selected.feedback !== null) ? state.view.feedback[state.view.selected.feedback] : null,
    quest: (state.view.selected.quest !== null) ? state.view.quests[state.view.selected.quest] : null,
    user: (state.view.selected.user !== null) ? state.view.users[state.view.selected.user] : null,
  };
};

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
    onSetUserLootPoints: (user: UserEntry, lootPoints: number) => {
      dispatch(mutateUser({userid: user.id, loot_points: lootPoints}));
    },
    onSetQuestPublishState: (quest: QuestEntry, published: boolean) => {
      dispatch(mutateQuest({questid: quest.id, partition: quest.partition, published}));
    },
    onSetFeedbackSuppressed: (feedback: FeedbackEntry, suppress: boolean) => {
      dispatch(mutateFeedback({partition: feedback.partition, questid: feedback.quest.id, userid: feedback.user.id, suppress}));
    },
  };
};

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer;
