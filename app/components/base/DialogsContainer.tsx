import Redux from 'redux'
import {connect} from 'react-redux'

import Dialogs, {DialogsStateProps, DialogsDispatchProps} from './Dialogs'
import {toPrevious} from '../../actions/Card'
import {setDialog} from '../../actions/Dialog'
import {changeSettings} from '../../actions/Settings'
import {remotePlayDisconnect} from '../../actions/RemotePlay'
import {userFeedbackChange} from '../../actions/UserFeedback'
import {submitUserFeedback} from '../../actions/Web'
import {MIN_FEEDBACK_LENGTH} from '../../Constants'
import {AppState, ContentSetsType, DialogIDType, DialogState, SettingsType, QuestState, UserState, UserFeedbackState} from '../../reducers/StateTypes'

const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  return {
    dialog: state.dialog,
    quest: state.quest,
    settings: state.settings,
    user: state.user,
    userFeedback: state.userFeedback || {} as any,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DialogsDispatchProps => {
  return {
    onExitQuest: () => {
      dispatch(setDialog(null));
      dispatch(toPrevious({name: 'SPLASH_CARD', before: false}));
    },
    onExitRemotePlay: () => {
      dispatch(remotePlayDisconnect());
      dispatch(setDialog(null));
      dispatch(toPrevious({name: 'SPLASH_CARD', before: false}));
    },
    onExpansionSelect: (contentSets: ContentSetsType) => {
      dispatch(setDialog(null));
      dispatch(changeSettings({contentSets}));
    },
    onFeedbackChange: (text: string) => {
      dispatch(userFeedbackChange({text}));
    },
    onFeedbackSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => {
      userFeedback.type = 'feedback';
      if (!userFeedback.text) {
        return alert('Please enter a description so that we can help resolve the issue.');
      }
      if (userFeedback.text.length < MIN_FEEDBACK_LENGTH) {
        return alert('Issue description must be at least ' + MIN_FEEDBACK_LENGTH + ' characters to provide value.');
      }
      dispatch(submitUserFeedback({quest, settings, user, userFeedback}));
      dispatch(setDialog(null));
    },
    onReportErrorSubmit: (error: string, quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => {
      userFeedback.type = 'report_error';
      if (!userFeedback.text) {
        return alert('Please enter a description of what you were doing so that we can help resolve the issue.');
      }
      if (userFeedback.text.length < MIN_FEEDBACK_LENGTH) {
        return alert('Issue description must be at least ' + MIN_FEEDBACK_LENGTH + ' characters to provide value.');
      }
      userFeedback.text += '... Error: ' + error;
      dispatch(submitUserFeedback({quest, settings, user, userFeedback}));
      dispatch(setDialog(null));
    },
    onReportQuestSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => {
      userFeedback.type = 'report_quest';
      if (!userFeedback.text) {
        return alert('Please type what you\'re reporting the quest for so that we can help resolve the issue.');
      }
      if (userFeedback.text.length < MIN_FEEDBACK_LENGTH) {
        return alert('Issue description must be at least ' + MIN_FEEDBACK_LENGTH + ' characters to provide value.');
      }
      dispatch(submitUserFeedback({quest, settings, user, userFeedback}));
      dispatch(setDialog(null));
    },
    onRequestClose: () => {
      dispatch(setDialog(null));
    },
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer
