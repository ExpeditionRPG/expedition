import {connect} from 'react-redux';
import Redux from 'redux';
import {Quest} from 'shared/schema/Quests';
import {toPrevious} from '../../actions/Card';
import {previewQuest} from '../../actions/Quest';
import {getContentSets} from '../../actions/Settings';
import {TUTORIAL_QUESTS} from '../../Constants';
import {AppState} from '../../reducers/StateTypes';
import QuestListCard, {DispatchProps, StateProps} from '../base/QuestListCard';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    quests: TUTORIAL_QUESTS,
    contentSets: getContentSets(state.settings, state.multiplayer),
    title: 'tutorials',
    icon: 'helper',
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onQuestSelect(quest: Quest): void {
      dispatch(previewQuest({quest}));
    },
    onReturn(): void {
      dispatch(toPrevious({}));
    },
  };
};

const TutorialsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestListCard);

export default TutorialsContainer;
