import {event} from 'app/actions/Quest';
import {getContentSets} from 'app/actions/Settings';
import {MAX_ADVENTURER_HEALTH} from 'app/Constants';
import {EventParameters} from 'app/reducers/QuestTypes';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {getCardTemplateTheme} from '../Template';
import {ParserNode} from '../TemplateTypes';
import {mapStateToProps as mapStateToPropsBase} from './Types';
import Victory, {DispatchProps, StateProps} from './Victory';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  const node = ownProps.node;
  if (!node) {
    throw Error('Incomplete props given');
  }

  const combat = node.ctx.templates.combat;
  let victoryParameters: EventParameters = {
    heal: MAX_ADVENTURER_HEALTH,
    loot: true,
    xp: true,
  };
  const parsedParams = node.getEventParameters('win');
  if (parsedParams !== null) {
    victoryParameters = parsedParams;
  }

  // Override with dynamic state for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    ...mapStateToPropsBase(state, ownProps),
    combat,
    victoryParameters,
    theme: getCardTemplateTheme(state.card),
    contentSets: getContentSets(state.settings, state.multiplayer),
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onEvent: (node: ParserNode, evt: string) => {
      dispatch(event({node, evt}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Victory);
