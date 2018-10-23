import {connect} from 'react-redux';
import Redux from 'redux';

import {Quest} from 'shared/schema/Quests';
import {toPrevious} from '../../actions/Card';
import {setDialog} from '../../actions/Dialog';
import {multiplayerDisconnect} from '../../actions/Multiplayer';
import {exitQuest} from '../../actions/Quest';
import {deleteSavedQuest} from '../../actions/SavedQuests';
import {changeSettings} from '../../actions/Settings';
import {openSnackbar} from '../../actions/Snackbar';
import {fetchQuestXML, logMultiplayerStats, submitUserFeedback} from '../../actions/Web';
import {MIN_FEEDBACK_LENGTH} from '../../Constants';
import {getCounters, MultiplayerCounters} from '../../multiplayer/Counters';
import {AppState, ContentSetsType, FeedbackType, QuestState, SavedQuestMeta, SettingsType, UserState} from '../../reducers/StateTypes';
import Dialogs, {DispatchProps, StateProps} from './Dialogs';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    dialog: state.dialog,
    multiplayer: state.multiplayer,
    multiplayerStats: getCounters(),
    quest: state.quest || {details: {}} as any,
    selectedSave: (state.quest && state.quest.savedTS) ? {details: state.quest.details, ts: state.quest.savedTS} : null,
    settings: state.settings,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onClose: () => {
      dispatch(setDialog(null));
    },
    onDeleteSavedQuest: (savedQuest: SavedQuestMeta) => {
      dispatch(deleteSavedQuest(savedQuest.details.id, savedQuest.ts));
      dispatch(setDialog(null));
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
    onPlayerDelta: (numLocalPlayers: number, delta: number) => {
      numLocalPlayers += delta;
      if (numLocalPlayers <= 0 || numLocalPlayers > 6) {
        return;
      }
      dispatch(changeSettings({numLocalPlayers}));
    },
    onSendMultiplayerReport: (user: UserState, quest: Quest, stats: MultiplayerCounters) => {
      logMultiplayerStats(user, quest, stats)
        .then((r: Response) => {
          dispatch(openSnackbar('Stats submitted. Thank you!'));
          dispatch(setDialog(null));
        });
    },
    playQuest: (details: Quest) => {
      dispatch(setDialog(null));
      dispatch(fetchQuestXML({details}));
    },
  };
};

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer;
