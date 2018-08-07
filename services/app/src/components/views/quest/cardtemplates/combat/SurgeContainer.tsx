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
import Surge, {DispatchProps, StateProps} from './Surge';
import {CombatPhase, CombatState} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  const node = ownProps.node;
  if (!node || !card) {
    throw Error('Incomplete props given');
  }

  // Override with dynamic state for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    node: state.quest.node,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onReturn: () => {
      // Return to the "Ready for Combat?" card instead of doing the timed round again.
      dispatch(toPrevious({before: false, skip: [{name: 'QUEST_CARD', phase: 'TIMER'}]}));
    },
    onSurgeNext: (node: ParserNode) => {
      dispatch(handleResolvePhase({node}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Surge);
