import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard, toPrevious} from '../../actions/Card';
import {previewQuest} from '../../actions/Quest';
import {selectPlayedQuest} from '../../actions/QuestHistory';
import {fetchQuestXML} from '../../actions/Web';
import {QuestDetails} from '../../reducers/QuestTypes';
import {AppState, UserQuestInstance} from '../../reducers/StateTypes';
import QuestHistory, {QuestHistoryDispatchProps, QuestHistoryStateProps} from './QuestHistory';

const mapStateToProps = (state: AppState, ownProps: QuestHistoryStateProps): QuestHistoryStateProps => {
  return {
    played: state.questHistory.list,
  };
};

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestHistoryDispatchProps => {
  return {
    onSelect(selected: UserQuestInstance): void {
      dispatch(previewQuest({quest: selected.details, lastPlayed: selected.lastPlayed}));
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
