import {connect} from 'react-redux';
import Redux from 'redux';

import {toPrevious} from 'app/actions/Card';
import {previewQuest} from 'app/actions/Quest';
import {getContentSets} from 'app/actions/Settings';
import {GM_QUESTS} from 'app/Constants';
import {AppState} from 'app/reducers/StateTypes';
import {Quest} from 'shared/schema/Quests';
import QuestListCard, {DispatchProps, StateProps} from '../base/QuestListCard';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    quests: GM_QUESTS,
    contentSets: getContentSets(state.settings, state.multiplayer),
    title: 'GM\'s Corner',
    icon: 'gm_corner',
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

const GMCornerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestListCard);

export default GMCornerContainer;
