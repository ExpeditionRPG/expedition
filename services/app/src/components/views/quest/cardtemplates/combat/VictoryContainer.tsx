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
import {CombatPhase, CombatState} from './Types';
import Victory, {DispatchProps, StateProps} from './Victory';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  const node = ownProps.node;
  if (!node || !card) {
    throw Error('Incomplete props given');
  }

  const combatFromNode = (node && node.ctx && node.ctx.templates && node.ctx.templates.combat);
  const combat: CombatState = combatFromNode || generateCombatTemplate(state.settings, false, state.quest.node, getStore().getState);
  let victoryParameters: EventParameters = {
    heal: MAX_ADVENTURER_HEALTH,
    loot: true,
    xp: true,
  };
  if (combatFromNode) {
    if (!combat.custom) {
      const parsedParams = node.getEventParameters('win');
      if (parsedParams !== null) {
        victoryParameters = parsedParams;
      }
    }
  }

  // Override with dynamic state for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    combat,
    node: state.quest.node,
    settings: state.settings,
    victoryParameters,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onCustomEnd: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', before: false}));
    },
    onEvent: (node: ParserNode, evt: string) => {
      dispatch(event({node, evt}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Victory);
