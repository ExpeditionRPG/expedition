import {connect} from 'react-redux';
import Redux from 'redux';

import {toPrevious} from 'app/actions/Card';
import {previewQuest} from 'app/actions/Quest';
import {GM_QUESTS} from 'app/Constants';
import {AppState, SettingsType} from 'app/reducers/StateTypes';
import {Quest} from 'shared/schema/Quests';
import GMCorner, {DispatchProps, StateProps} from './GMCorner';
import {initCustomCombat} from './quest/cardtemplates/combat/Actions';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    quests: GM_QUESTS,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onQuestSelect(quest: Quest): void {
      dispatch(previewQuest({quest}));
    },
    onCustomCombatSelect(settings: SettingsType): void {
      dispatch(initCustomCombat({}));
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
