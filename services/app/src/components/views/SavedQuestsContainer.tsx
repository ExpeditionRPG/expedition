import Redux from 'redux'
import {connect} from 'react-redux'
import SavedQuests, {SavedQuestsStateProps, SavedQuestsDispatchProps} from './SavedQuests'
import {AppState, SavedQuestMeta} from '../../reducers/StateTypes'
import {setDialog} from '../../actions/Dialog'
import {loadSavedQuest, selectSavedQuest} from '../../actions/SavedQuests'
import {toCard, toPrevious} from '../../actions/Card'

const mapStateToProps = (state: AppState, ownProps: SavedQuestsStateProps): SavedQuestsStateProps => {
  return {
    phase: ownProps.phase,
    saved: state.saved.list,
    selected: state.saved.selected,
  };
}

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SavedQuestsDispatchProps => {
  return {
    onPlay(id: string, ts: number): void {
      dispatch(loadSavedQuest(id, ts));
      dispatch(toCard({name: 'QUEST_CARD'}));
    },
    onDelete(selected: SavedQuestMeta): void {
      dispatch(setDialog('DELETE_SAVED_QUEST'));
    },
    onSelect(selected: SavedQuestMeta): void {
      dispatch(selectSavedQuest(selected));
      dispatch(toCard({name: 'SAVED_QUESTS', phase: 'DETAILS'}))
    },
    onReturn(): void {
      dispatch(toPrevious({}));
    },
  };
}

const SavedQuestsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SavedQuests);

export default SavedQuestsContainer
