import {getMultiplayerClient} from 'app/Multiplayer';
import {AppStateWithHistory, SettingsType} from 'app/reducers/StateTypes';
import {getStore} from 'app/Store';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {
  generateCombatTemplate,
  handleCombatTimerHold,
  handleCombatTimerStop,
} from './Actions';
import TimerCard, {DispatchProps, StateProps} from './TimerCard';
import {CombatState} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  const node = ownProps.node;
  if (!node) {
    throw Error('Incomplete props given');
  }

  const combatFromNode = (node && node.ctx && node.ctx.templates && node.ctx.templates.combat);
  const combat: CombatState = combatFromNode || generateCombatTemplate(state.settings, false, state.quest.node, getStore().getState);
  const stateCombat = (state.quest.node && state.quest.node.ctx && state.quest.node.ctx.templates && state.quest.node.ctx.templates.combat)
    || {tier: 0, mostRecentRolls: [10], numAliveAdventurers: 1};

  // Override with dynamic state for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    combat,
    multiplayerState: state.multiplayer,
    node: state.quest.node,
    numAliveAdventurers: stateCombat.numAliveAdventurers,
    seed: state.quest.seed,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onTimerStop: (node: ParserNode, settings: SettingsType, elapsedMillis: number, surge: boolean, seed: string) => {
      const multiplayerConnected = getMultiplayerClient().isConnected();

      // We don't want to **stop** the timer if we're connected to remote
      // play. Rather, we want to wait until everyone's timer is stopped
      // before moving on.
      // The server will tell us once everyone's ready.
      if (multiplayerConnected) {
        dispatch(handleCombatTimerHold({elapsedMillis}));
      } else {
        dispatch(handleCombatTimerStop({node, settings, elapsedMillis, seed}));
      }
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimerCard);
