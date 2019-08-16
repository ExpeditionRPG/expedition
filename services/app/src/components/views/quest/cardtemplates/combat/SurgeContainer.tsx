import {toPrevious} from 'app/actions/Card';
import {CombatPhase} from 'app/Constants';
import {AppStateWithHistory, CardName} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {
  handleResolvePhase,
} from './Actions';
import Surge, {DispatchProps} from './Surge';
import {mapStateToProps as mapStateToPropsBase, StateProps} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return mapStateToPropsBase(state, ownProps);
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onReturn: () => {
      // Return to the "Ready for Combat?" card instead of doing the timed round again.
      dispatch(toPrevious({before: false, matchFn: (c: CardName, n: ParserNode) => n.ctx.templates.combat.phase !== CombatPhase.timer}));
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
