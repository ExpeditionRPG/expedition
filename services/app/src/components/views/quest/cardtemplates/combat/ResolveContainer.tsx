import {toPrevious} from 'app/actions/Card';
import {getContentSets} from 'app/actions/Settings';
import {CombatPhase} from 'app/Constants';
import {AppStateWithHistory, CardName} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {toCombatPhase} from './Actions';
import Resolve, {DispatchProps, StateProps} from './Resolve';
import {mapStateToProps as mapStateToPropsBase} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return {
    ...mapStateToPropsBase(state, ownProps),
    mostRecentRolls: state.quest.node.ctx.templates.combat.mostRecentRolls,
    contentSets: getContentSets(state.settings, state.multiplayer),
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onNext: (node: ParserNode, phase: CombatPhase) => {
      dispatch(toCombatPhase({node, phase}));
    },
    onReturn: () => {
      // Return to the "Ready for Combat?" card instead of doing the timed round again.
      dispatch(toPrevious({before: false, matchFn: (c: CardName, n: ParserNode) => n.ctx.templates.combat.phase !== CombatPhase.timer}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Resolve);
