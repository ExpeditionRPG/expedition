import {toCard} from 'app/actions/Card';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {resolveCombat} from '../Params';
import {ParserNode} from '../TemplateTypes';
import {
  tierSumDelta,
} from './Actions';
import DrawEnemies, {DispatchProps, StateProps} from './DrawEnemies';
import {CombatPhase} from './Types';
import {mapStateToProps as mapStateToPropsBase} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  // Override with dynamic state for tier
  // Any change causes a repaint
  return {
    ...mapStateToPropsBase(state, ownProps),
    combat: resolveCombat(ownProps.node),
    tier: resolveCombat(state.quest.node).tier,
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
