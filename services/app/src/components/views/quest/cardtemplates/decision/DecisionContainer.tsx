import {toCard} from 'app/actions/Card';
import {AppStateWithHistory, SettingsType} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {DecisionType, EMPTY_DECISION_STATE} from '../decision/Types';
import {ParserNode} from '../TemplateTypes';
import {
  handleDecisionRoll,
  handleDecisionSelect,
  handleDecisionTimerStart,
} from './Actions';
import Decision, {DispatchProps, StateProps} from './Decision';
import {DecisionState} from './Types';

const mapStateToProps = (state: AppStateWithHistory): StateProps => {
  const stateDecision = (state.quest.node && state.quest.node.ctx && state.quest.node.ctx.templates && state.quest.node.ctx.templates.decision) || EMPTY_DECISION_STATE;

  return {
    card: state.card,
    decision: stateDecision,
    multiplayerState: state.multiplayer,
    node: state.quest.node,
    seed: state.quest.seed,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onChoice: (node: ParserNode, settings: SettingsType, choice: DecisionType, elapsedMillis: number, seed: string) => {
      dispatch(handleDecisionSelect({node, settings, elapsedMillis, decision: choice, seed}));
      dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_DECISION'}));
    },
    onEnd: () => {
      // TODO
    },
    onRoll: (node: ParserNode, settings: SettingsType, decision: DecisionState, roll: number, seed: string) => {
      dispatch(handleDecisionRoll({node, settings, scenario: decision.scenario, roll, seed}));
      const numOutcomes = decision.outcomes.length;
      dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_DECISION',  keySuffix: ((numOutcomes !== undefined) ? numOutcomes.toString() : '')}));
    },
    onStartTimer: () => {
      dispatch(handleDecisionTimerStart({}));
      dispatch(toCard({name: 'QUEST_CARD', phase: 'DECISION_TIMER'}));
    },
  };
};

const DecisionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Decision);

export default DecisionContainer;
