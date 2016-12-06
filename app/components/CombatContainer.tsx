import { connect } from 'react-redux'
import {AppStateWithHistory, XMLElement, SettingsType, CardName} from '../reducers/StateTypes'
import {CombatPhaseNameType, MidCombatPhase, QuestContext} from '../reducers/QuestTypes'
import {toPrevious, toCard} from '../actions/card'
import {event, handleCombatTimerStop, combatDefeat, combatVictory, tierSumDelta, adventurerDelta} from '../actions/quest'
import Combat, {CombatStateProps, CombatDispatchProps} from './Combat'

const mapStateToProps = (state: AppStateWithHistory, ownProps: CombatStateProps): CombatStateProps => {
  var maxTier = 0;
  let histIdx: number = state._history.length-1;
  while(state._history[histIdx] != null && state._history[histIdx].combat !== undefined && histIdx > 0) {
    var tier = state._history[histIdx].combat.tier;
    if (!tier || state._history[histIdx].card.phase !== 'PREPARE') {
      histIdx--;
      continue;
    }
    maxTier = Math.max(maxTier, tier);
    histIdx--;
  }

  if (ownProps.custom) {
    return {
      custom: true,
      card: ownProps.card,
      settings: state.settings,
      maxTier: maxTier,
      ctx: state.quest && state.quest.result.ctx,
      combat: state.combat || {enemies: [], roundCount: 0, numAliveAdventurers: 0, tier: 0, roundTimeMillis: 0, surgePeriod: 0, damageMultiplier: 0},
    };
  } else {
    return {
      custom: false,
      card: ownProps.card,
      combat: Object.assign({}, ownProps.combat, {
        tier: state.combat && state.combat.tier,
        numAliveAdventurers: state.combat && state.combat.numAliveAdventurers}),
      ctx: state.quest && state.quest.result.ctx,
      node: ownProps.node,
      maxTier: maxTier,
      icon: ownProps.icon,
      settings: state.settings,
    };
  }
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): CombatDispatchProps => {
  return {
    onNext: (cardName: CardName, phase: CombatPhaseNameType) => {
      dispatch(toCard(cardName, phase));
    },
    onVictory: (cardName: CardName, maxTier: number, settings: SettingsType) => {
      dispatch(toCard(cardName, 'VICTORY'));
      dispatch(combatVictory(settings.numPlayers, maxTier));
    },
    onDefeat: (cardName: CardName) => {
      dispatch(toCard(cardName, 'DEFEAT'));
      dispatch(combatDefeat());
    },
    onTimerStop: (cardName: CardName, elapsedMillis: number, surge: boolean) => {
      if (surge) {
        dispatch(toCard(cardName, 'SURGE'));
      } else {
        dispatch(toCard(cardName, 'RESOLVE_ABILITIES'));
      }
      dispatch(handleCombatTimerStop(elapsedMillis));
    },
    onPostTimerReturn: (cardName: CardName) => {
      // Return to the "Ready for Combat?" card instead of doing the timed round again.
      dispatch(toPrevious(cardName, 'PREPARE'));
    },
    onEvent: (node: XMLElement, evt: string, ctx: QuestContext) => {
      dispatch(event(node, evt, ctx));
    },
    onTierSumDelta: (delta: number) => {
      dispatch(tierSumDelta(delta));
    },
    onAdventurerDelta: (numPlayers: number, delta: number) => {
      dispatch(adventurerDelta(numPlayers, delta));
    },
    onCustomEnd: () => {
      dispatch(toPrevious('CUSTOM_COMBAT', 'DRAW_ENEMIES', false));
    },
  };
}

const CombatContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Combat);

export default CombatContainer
