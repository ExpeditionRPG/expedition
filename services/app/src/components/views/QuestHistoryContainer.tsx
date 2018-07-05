import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard, toPrevious} from '../../actions/Card';
import {setDialog} from '../../actions/Dialog';
import {selectPlayedQuest} from '../../actions/Quest';
import {fetchQuestXML} from '../../actions/Web';
import {QuestDetails} from '../../reducers/QuestTypes';
import {AppState, UserQuestInstance} from '../../reducers/StateTypes';
import QuestHistory, {QuestHistoryDispatchProps, QuestHistoryStateProps} from './QuestHistory';

const mapStateToProps = (state: AppState, ownProps: QuestHistoryStateProps): QuestHistoryStateProps => {
  return {
    phase: ownProps.phase,
    played: state.questHistory.list,
    selected: state.questHistory.selected,
  };
};

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestHistoryDispatchProps => {
  return {
    onPlay(details: QuestDetails): void {
      // We must dispatch VIEW_QUEST so the quest details are
      // propagated appropriately for analytics.
      dispatch({type: 'VIEW_QUEST', quest: details});
      dispatch(fetchQuestXML(details));
    },
    onSelect(selected: UserQuestInstance): void {
      dispatch(selectPlayedQuest(selected));
      dispatch(toCard({name: 'QUEST_HISTORY', phase: 'DETAILS'}));
    },
    onReturn(): void {
      dispatch(toPrevious({}));
    },
  };
};

const QuestHistoryContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestHistory);

export default QuestHistoryContainer;
