import {toCard} from 'app/actions/Card';
import {CombatPhase} from 'app/Constants';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {
  tierSumDelta,
} from './Actions';
import DrawEnemies, {DispatchProps, StateProps} from './DrawEnemies';
import {mapStateToProps as mapStateToPropsBase} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: {node: ParserNode}): StateProps => {
  // Override with dynamic state for tier
  // Any change causes a repaint
  return {
    ...mapStateToPropsBase(state, ownProps),
    combat: ownProps.node.ctx.templates.combat,
    tier: state.quest.node.ctx.templates.combat.tier,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onNext: (phase: CombatPhase) => {
      dispatch(toCard({name: 'QUEST_CARD', phase}));
    },
    onTierSumDelta: (node: ParserNode, current: number, delta: number) => {
      dispatch(tierSumDelta({node, current, delta}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawEnemies);
