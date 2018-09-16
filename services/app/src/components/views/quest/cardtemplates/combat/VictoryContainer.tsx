import {toPrevious} from 'app/actions/Card';
import {event} from 'app/actions/Quest';
import {MAX_ADVENTURER_HEALTH} from 'app/Constants';
import {EventParameters} from 'app/reducers/QuestTypes';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {resolveCombat} from '../Params';
import {getCardTemplateTheme} from '../Template';
import {ParserNode} from '../TemplateTypes';
import {mapStateToProps as mapStateToPropsBase} from './Types';
import Victory, {DispatchProps, StateProps} from './Victory';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  const node = ownProps.node;
  if (!node) {
    throw Error('Incomplete props given');
  }

  const combatFromNode = (node && node.ctx && node.ctx.templates && node.ctx.templates.combat);
  const combat = resolveCombat(node);
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
    ...mapStateToPropsBase(state, ownProps),
    combat,
    victoryParameters,
    theme: getCardTemplateTheme(state.card),
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
