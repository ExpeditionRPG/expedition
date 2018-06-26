import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../../../../actions/Card';
import {AppStateWithHistory, SettingsType} from '../../../../../reducers/StateTypes';
import {DecisionType, EMPTY_DECISION_STATE} from '../decision/Types';
import {ParserNode} from '../TemplateTypes';
import {
  handleDecisionRoll,
  handleDecisionSelect,
  handleDecisionTimerStart,
} from './Actions';
import Decision, {DecisionDispatchProps, DecisionStateProps} from './Decision';
import {DecisionState} from './Types';

declare var window: any;

const mapStateToProps = (state: AppStateWithHistory, ownProps: DecisionStateProps): DecisionStateProps => {
  const stateDecision = (state.quest.node && state.quest.node.ctx && state.quest.node.ctx.templates && state.quest.node.ctx.templates.decision) || EMPTY_DECISION_STATE;

  return {
    card: state.card,
    decision: stateDecision,
    settings: state.settings,
    node: state.quest.node,
    seed: state.quest.seed,
    multiplayerState: state.multiplayer,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DecisionDispatchProps => {
  return {
    onStartTimer: () => {
      dispatch(handleDecisionTimerStart({}));
      dispatch(toCard({name: 'QUEST_CARD', phase: 'DECISION_TIMER'}));
    },
    onChoice: (node: ParserNode, settings: SettingsType, choice: DecisionType, elapsedMillis: number, seed: string) => {
      dispatch(handleDecisionSelect({node, settings, elapsedMillis, decision: choice, seed}));
      dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_DECISION'}));
    },
    onRoll: (node: ParserNode, settings: SettingsType, decision: DecisionState, roll: number, seed: string) => {
      dispatch(handleDecisionRoll({node, settings, scenario: decision.scenario, roll, seed}));
      const numOutcomes = decision.outcomes.length;
      dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_DECISION',  keySuffix: ((numOutcomes !== undefined) ? numOutcomes.toString() : '')}));
    },
    onEnd: () => {
      // TODO
    },
  };
};

const DecisionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Decision);

export default DecisionContainer;
