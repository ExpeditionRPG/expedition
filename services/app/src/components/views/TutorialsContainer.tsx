import {connect} from 'react-redux';
import Redux from 'redux';

import {Quest} from 'shared/schema/Quests';
import {previewQuest} from '../../actions/Quest';
import {TUTORIAL_QUESTS} from '../../Constants';
import {AppState} from '../../reducers/StateTypes';
import Tutorials, {DispatchProps, StateProps} from './Tutorials';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    quests: TUTORIAL_QUESTS,
    settings: state.settings,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onQuestSelect(quest: Quest): void {
      dispatch(previewQuest({quest}));
    },
  };
};

const TutorialsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tutorials);

export default TutorialsContainer;
