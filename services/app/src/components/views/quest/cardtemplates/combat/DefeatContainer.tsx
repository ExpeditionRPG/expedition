import {toPrevious} from 'app/actions/Card';
import {event} from 'app/actions/Quest';
import {CombatPhase} from 'app/Constants';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import Defeat, {DispatchProps, StateProps} from './Defeat';
import {mapStateToProps as mapStateToPropsBase} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: {node: ParserNode}): StateProps => {
  // Override with dynamic state for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    ...mapStateToPropsBase(state, ownProps),
    combat: ownProps.node.ctx.templates.combat,
    mostRecentRolls: state.quest.node.ctx.templates.combat.mostRecentRolls,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onEvent: (node: ParserNode, evt: string) => {
      dispatch(event({node, evt}));
    },
    onRetry: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: CombatPhase.drawEnemies, before: true}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Defeat);
