import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard, toPrevious} from '../../actions/Card';
import {setDialog} from '../../actions/Dialog';
import {deleteSavedQuest, loadSavedQuest, saveQuestForOffline} from '../../actions/SavedQuests';
import {openSnackbar} from '../../actions/Snackbar';
import {fetchQuestXML} from '../../actions/Web';
import {QuestDetails} from '../../reducers/QuestTypes';
import {AppStateWithHistory, SavedQuestMeta} from '../../reducers/StateTypes';
import QuestPreview, {QuestPreviewDispatchProps, QuestPreviewStateProps} from './QuestPreview';

const mapStateToProps = (state: AppStateWithHistory, ownProps: QuestPreviewStateProps): QuestPreviewStateProps => {
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

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestPreviewDispatchProps => {
  return {
    onPlay: (quest: QuestDetails, isDirectLinked: boolean) => {
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
    onSave(quest: QuestDetails) {
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
