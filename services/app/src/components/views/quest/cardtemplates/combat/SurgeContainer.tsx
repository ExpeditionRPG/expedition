import {toPrevious} from 'app/actions/Card';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {
  handleResolvePhase,
} from './Actions';
import Surge, {DispatchProps} from './Surge';
import {CombatPhase, mapStateToProps} from './Types';

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onReturn: () => {
      // Return to the "Ready for Combat?" card instead of doing the timed round again.
      dispatch(toPrevious({before: false, skip: [{name: 'QUEST_CARD', phase: CombatPhase.timer}]}));
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
