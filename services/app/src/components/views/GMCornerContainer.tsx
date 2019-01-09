import {connect} from 'react-redux';
import Redux from 'redux';

import {toPrevious} from 'app/actions/Card';
import {previewQuest} from 'app/actions/Quest';
import {getContentSets} from 'app/actions/Settings';
import {GM_QUESTS} from 'app/Constants';
import {AppState} from 'app/reducers/StateTypes';
import {Quest} from 'shared/schema/Quests';
import GMCorner, {DispatchProps, StateProps} from './GMCorner';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    quests: GM_QUESTS,
    contentSets: getContentSets(state.settings, state.multiplayer),
  };
};

// TODO: Merge this code with <Tutorials/> once GM corner quests are added here... use a "custom combat" quest of some kind instead.
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

const GMCornerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMCorner);

export default GMCornerContainer;
