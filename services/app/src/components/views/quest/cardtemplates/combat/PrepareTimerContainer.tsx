import {toCard, toPrevious} from 'app/actions/Card';
import {event} from 'app/actions/Quest';
import {MAX_ADVENTURER_HEALTH} from 'app/Constants';
import {logEvent} from 'app/Logging';
import {getMultiplayerClient} from 'app/Multiplayer';
import {EventParameters} from 'app/reducers/QuestTypes';
import {AppStateWithHistory, SettingsType} from 'app/reducers/StateTypes';
import {getStore} from 'app/Store';
import {connect} from 'react-redux';
import Redux from 'redux';
import {
  midCombatChoice,
} from '../roleplay/Actions';
import {ParserNode} from '../TemplateTypes';
import {
  adventurerDelta,
  generateCombatTemplate,
  handleCombatEnd,
  handleCombatTimerHold,
  handleCombatTimerStart,
  handleCombatTimerStop,
  handleResolvePhase,
  setupCombatDecision,
  tierSumDelta,
} from './Actions';
import PrepareTimer, {DispatchProps, StateProps} from './PrepareTimer';
import {CombatPhase, CombatState} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return {
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onTimerStart: () => {
      dispatch(handleCombatTimerStart({}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrepareTimer);
