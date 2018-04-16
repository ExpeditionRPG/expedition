import Redux from 'redux'
import {connect} from 'react-redux'

import Dialogs, {DialogsStateProps, DialogsDispatchProps} from './Dialogs'
import {toPrevious} from '../../actions/Card'
import {setDialog} from '../../actions/Dialog'
import {openSnackbar} from '../../actions/Snackbar'
import {changeSettings} from '../../actions/Settings'
import {remotePlayDisconnect} from '../../actions/RemotePlay'
import {userFeedbackChange} from '../../actions/UserFeedback'
import {submitUserFeedback, logRemotePlayStats, fetchQuestXML} from '../../actions/Web'
import {MIN_FEEDBACK_LENGTH} from '../../Constants'
import {getRemotePlayClient, RemotePlayCounters, initialRemotePlayCounters} from '../../RemotePlay'
import {AppState, ContentSetsType, DialogIDType, DialogState, SettingsType, QuestState, UserState, UserFeedbackState} from '../../reducers/StateTypes'
import {QuestDetails} from '../../reducers/QuestTypes'

const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  let remotePlayStats: RemotePlayCounters;
  if (state.dialog && state.dialog.open === 'REMOTE_PLAY_STATUS') {
    remotePlayStats = getRemotePlayClient().getStats();
  } else {
    remotePlayStats = initialRemotePlayCounters;
  }

  return {
    dialog: state.dialog,
    quest: state.quest || {details: {}} as any,
    settings: state.settings,
    user: state.user,
    remotePlayStats,
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
    onMultitouchChange: (v: boolean) => {
      dispatch(changeSettings({multitouch: v}));
    },
    onSendRemotePlayReport: (user: UserState, quest: QuestDetails, stats: RemotePlayCounters) => {
      logRemotePlayStats(user, quest, stats)
        .then((r: Response) => {
          dispatch(openSnackbar('Stats submitted. Thank you!'));
          dispatch(setDialog(null));
        })
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
    onPlayerDelta: (numPlayers: number, delta: number) => {
      numPlayers += delta;
      if (numPlayers <= 0 || numPlayers > 6) {
        return;
      }
      dispatch(changeSettings({numPlayers}));
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
    playQuest: (quest: QuestDetails) => {
      dispatch(setDialog(null));
      dispatch(fetchQuestXML(quest));
    }
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer
