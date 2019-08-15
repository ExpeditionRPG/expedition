import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {
  gotoPhase,
  tierSumDelta,
} from './Actions';
import DrawEnemies, {DispatchProps, StateProps} from './DrawEnemies';
import {CombatPhase} from './Types';
import {mapStateToProps as mapStateToPropsBase} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: {node: ParserNode}): StateProps => {
  // Override with dynamic state for tier
  // Any change causes a repaint
  return {
    ...mapStateToPropsBase(state, ownProps),
    combat: ownProps.node.ctx.templates.combat,
    tier: ownProps.node.ctx.templates.combat.tier,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onNext: (node: ParserNode) => {
      dispatch(gotoPhase({node, phase: CombatPhase.prepare}));
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
