import {connect} from 'react-redux';
import Redux from 'redux';

import {toPrevious} from '../../actions/Card';
import {setDialog} from '../../actions/Dialog';
import {multiplayerDisconnect} from '../../actions/Multiplayer';
import {exitQuest} from '../../actions/Quest';
import {deleteSavedQuest} from '../../actions/SavedQuests';
import {changeSettings} from '../../actions/Settings';
import {openSnackbar} from '../../actions/Snackbar';
import {fetchQuestXML, logMultiplayerStats, submitUserFeedback} from '../../actions/Web';
import {MIN_FEEDBACK_LENGTH} from '../../Constants';
import {getMultiplayerClient, initialMultiplayerCounters, MultiplayerCounters} from '../../Multiplayer';
import {QuestDetails} from '../../reducers/QuestTypes';
import {AppState, ContentSetsType, FeedbackType, QuestState, SavedQuestMeta, SettingsType, UserState} from '../../reducers/StateTypes';
import Dialogs, {DialogsDispatchProps, DialogsStateProps} from './Dialogs';

const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  let multiplayerStats: MultiplayerCounters;
  if (state.dialog && state.dialog.open === 'MULTIPLAYER_STATUS') {
    multiplayerStats = getMultiplayerClient().getStats();
  } else {
    multiplayerStats = initialMultiplayerCounters;
  }

  return {
    dialog: state.dialog,
    multiplayerStats,
    quest: state.quest || {details: {}} as any,
    selectedSave: state.saved.selected || {} as SavedQuestMeta,
    settings: state.settings,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DialogsDispatchProps => {
  return {
    onClose: () => {
      dispatch(setDialog(null));
    },
    onDeleteSavedQuest: (savedQuest: SavedQuestMeta) => {
      dispatch(deleteSavedQuest(savedQuest.details.id, savedQuest.ts));
      dispatch(toPrevious({name: 'SAVED_QUESTS', phase: 'LIST', before: false}));
      dispatch(openSnackbar('Save deleted.'));
    },
    onExitMultiplayer: () => {
      dispatch(multiplayerDisconnect());
      dispatch(setDialog(null));
      dispatch(toPrevious({name: 'SPLASH_CARD', before: false}));
    },
    onExitQuest: () => {
      dispatch(setDialog(null));
      dispatch(exitQuest({}));
      dispatch(toPrevious({name: 'SPLASH_CARD', before: false}));
    },
    onExpansionSelect: (contentSets: ContentSetsType) => {
      dispatch(setDialog(null));
      dispatch(changeSettings({contentSets}));
    },
    onFeedbackSubmit: (type: FeedbackType, quest: QuestState, settings: SettingsType, user: UserState, text: string) => {
      if (!text) {
        return alert('Please enter a description so that we can help resolve the issue.');
      }
      if (text.length < MIN_FEEDBACK_LENGTH) {
        return alert('Issue description must be at least ' + MIN_FEEDBACK_LENGTH + ' characters to provide value.');
      }
      dispatch(submitUserFeedback({quest, settings, user, text, type, anonymous: false, rating: null}));
      dispatch(setDialog(null));
    },
    onMultitouchChange: (v: boolean) => {
      dispatch(changeSettings({multitouch: v}));
    },
    onPlayerDelta: (numPlayers: number, delta: number) => {
      numPlayers += delta;
      if (numPlayers <= 0 || numPlayers > 6) {
        return;
      }
      dispatch(changeSettings({numPlayers}));
    },
    onSendMultiplayerReport: (user: UserState, quest: QuestDetails, stats: MultiplayerCounters) => {
      logMultiplayerStats(user, quest, stats)
        .then((r: Response) => {
          dispatch(openSnackbar('Stats submitted. Thank you!'));
          dispatch(setDialog(null));
        });
    },
    playQuest: (quest: QuestDetails) => {
      dispatch(setDialog(null));
      dispatch(fetchQuestXML(quest));
    },
  };
};

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer;
