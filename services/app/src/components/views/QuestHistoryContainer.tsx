import {connect} from 'react-redux';
import Redux from 'redux';
import {toPrevious} from '../../actions/Card';
import {previewQuest} from '../../actions/Quest';
import {AppState, UserQuestInstance} from '../../reducers/StateTypes';
import QuestHistory, {DispatchProps, StateProps} from './QuestHistory';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    played: state.userQuests.history,
  };
};

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
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
