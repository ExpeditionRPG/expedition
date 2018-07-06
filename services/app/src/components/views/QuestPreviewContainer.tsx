import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard, toPrevious} from '../../actions/Card';
import {setDialog} from '../../actions/Dialog';
import {loadSavedQuest} from '../../actions/SavedQuests';
import {fetchQuestXML} from '../../actions/Web';
import {QuestDetails} from '../../reducers/QuestTypes';
import {AppStateWithHistory} from '../../reducers/StateTypes';
import QuestPreview, {QuestPreviewDispatchProps, QuestPreviewStateProps} from './QuestPreview';

const mapStateToProps = (state: AppStateWithHistory, ownProps: QuestPreviewStateProps): QuestPreviewStateProps => {
  return {
    isDirectLinked: state._history.length <= 1,
    quest: state.quest.details,
    lastPlayed: (state.questHistory.list[(state.quest.details || {id: '-1'}).id] || {}).lastPlayed,
    savedTS: state.quest.savedTS,
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
