import {connect} from 'react-redux';
import Redux from 'redux';
import {Quest} from 'shared/schema/Quests';
import {toCard, toPrevious} from '../../actions/Card';
import {setDialog} from '../../actions/Dialog';
import {deleteSavedQuest, loadSavedQuest, saveQuestForOffline} from '../../actions/SavedQuests';
import {openSnackbar} from '../../actions/Snackbar';
import {fetchQuestXML} from '../../actions/Web';
import {AppStateWithHistory, SavedQuestMeta} from '../../reducers/StateTypes';
import QuestPreview, {DispatchProps, StateProps} from './QuestPreview';

const mapStateToProps = (state: AppStateWithHistory): StateProps => {
  const savedInstances = state.saved.list.filter((s: SavedQuestMeta) => {
    return s.details.id === state.quest.details.id;
  });

  return {
    isDirectLinked: state._history.length <= 1,
    quest: state.quest.details,
    lastPlayed: (state.questHistory.list[(state.quest.details || {id: '-1'}).id] || {}).lastPlayed,
    savedInstances,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onPlay: (quest: Quest, isDirectLinked: boolean) => {
      if (isDirectLinked) {
        dispatch(setDialog('SET_PLAYER_COUNT'));
      } else {
        dispatch(fetchQuestXML(quest));
      }
    },
    onPlaySaved(id: string, ts: number): void {
      dispatch(loadSavedQuest(id, ts));
      dispatch(toCard({name: 'QUEST_CARD'}));
    },
    onSave(quest: Quest) {
      dispatch(saveQuestForOffline(quest));
    },
    onDeleteOffline(id: string, ts: number): void {
      dispatch(deleteSavedQuest(id, ts));
      dispatch(openSnackbar('Deleted offline version.'));
    },
    onDeleteConfirm(): void {
      dispatch(setDialog('DELETE_SAVED_QUEST'));
    },
    onReturn: () => {
      dispatch(toPrevious({}));
    },
  };
};

const QuestPreviewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestPreview);

export default QuestPreviewContainer;
