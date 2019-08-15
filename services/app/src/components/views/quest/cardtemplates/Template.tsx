import {getContentSets, numAdventurers} from 'app/actions/Settings';
import {CombatPhase, DecisionPhase} from 'app/Constants';
import {AppStateWithHistory, CardState, CardThemeType, SettingsType} from 'app/reducers/StateTypes';
import {getStore} from 'app/Store';
import * as React from 'react';
import Redux from 'redux';
import {generateSeed} from 'shared/parse/Context';
import {initCombat} from './combat/Actions';
import DefeatContainer from './combat/DefeatContainer';
import DrawEnemiesContainer from './combat/DrawEnemiesContainer';
import MidCombatRoleplayContainer from './combat/MidCombatRoleplayContainer';
import NoTimerContainer from './combat/NoTimerContainer';
import PlayerTierContainer from './combat/PlayerTierContainer';
import PrepareTimerContainer from './combat/PrepareTimerContainer';
import ResolveContainer from './combat/ResolveContainer';
import {combatScope} from './combat/Scope';
import SurgeContainer from './combat/SurgeContainer';
import TimerCardContainer from './combat/TimerCardContainer';
import {EMPTY_COMBAT_STATE} from './combat/Types';
import VictoryContainer from './combat/VictoryContainer';
import {initDecision} from './decision/Actions';
import DecisionTimerContainer from './decision/DecisionTimerContainer';
import PrepareDecisionContainer from './decision/PrepareDecisionContainer';
import ResolveDecisionContainer from './decision/ResolveDecisionContainer';
import {EMPTY_DECISION_STATE} from './decision/Types';
import {initRoleplay} from './roleplay/Actions';
import RoleplayContainer from './roleplay/RoleplayContainer';
import {ParserNode, TemplateContext} from './TemplateTypes';

export function initCardTemplate(node: ParserNode) {
  return (dispatch: Redux.Dispatch<any>): any => {
    switch (node.getTag()) {
      case 'roleplay':
        return dispatch(initRoleplay(node));
      case 'combat':
        return dispatch(initCombat({node}));
      case 'decision':
        return dispatch(initDecision({node}));
      default:
        throw new Error('Unsupported node type ' + node.getTag());
    }
  };
}

export function renderCardTemplate(card: CardState, node: ParserNode, settings: SettingsType): JSX.Element {
  const phase = card.phase || 'ROLEPLAY';
  switch (phase) {
    case 'ROLEPLAY':
      return <RoleplayContainer node={node}/>;
    case DecisionPhase.prepare:
      return <PrepareDecisionContainer node={node}/>;
    case DecisionPhase.timer:
      return <DecisionTimerContainer node={node}/>;
    case DecisionPhase.resolve:
      return <ResolveDecisionContainer node={node}/>;
    case CombatPhase.drawEnemies:
      return <DrawEnemiesContainer node={node}/>;
    case CombatPhase.prepare:
      // Must handle conditional display of timer vs no timer here to
      // allow for timer length changes on the "prepare" card to dynamically
      // change which screen is shown.
      if (!settings.timerSeconds) {
        return <NoTimerContainer node={node}/>;
      } else {
        console.log('PrepareTimerContainer');
        return <PrepareTimerContainer node={node}/>;
      }
    case CombatPhase.timer:
      return <TimerCardContainer node={node}/>;
    case CombatPhase.surge:
      return <SurgeContainer node={node}/>;
    case CombatPhase.resolveAbilities:
      return <ResolveContainer node={node}/>;
    case CombatPhase.resolveDamage:
      return <PlayerTierContainer node={node}/>;
    case CombatPhase.victory:
      return <VictoryContainer node={node}/>;
    case CombatPhase.defeat:
      return <DefeatContainer node={node}/>;
    case CombatPhase.midCombatRoleplay:
      return <MidCombatRoleplayContainer node={node}/>;
    case CombatPhase.midCombatDecision:
    case CombatPhase.midCombatDecisionTimer:
      return renderCardTemplate({...card, phase: node.ctx.templates.decision.phase}, node, settings);
    default:
      throw new Error('Unknown template for card phase ' + card.phase);
  }
}

export function getCardTemplateTheme(card: CardState): CardThemeType {
  switch (card.phase || 'ROLEPLAY') {
    case CombatPhase.drawEnemies:
    case CombatPhase.prepare:
    case CombatPhase.timer:
    case CombatPhase.surge:
    case CombatPhase.resolveAbilities:
    case CombatPhase.resolveDamage:
    case CombatPhase.victory:
    case CombatPhase.defeat:
    case CombatPhase.midCombatRoleplay:
    case CombatPhase.midCombatDecision:
    case CombatPhase.midCombatDecisionTimer:
      return 'dark';
    case 'ROLEPLAY':
    case DecisionPhase.prepare:
    case DecisionPhase.timer:
    case DecisionPhase.resolve:
    default:
      return 'light';
  }
}

export function templateScope() {
  return combatScope();
}

export function defaultContext(getState: (() => AppStateWithHistory) = getStore().getState): TemplateContext {
  const populateScopeFn = () => {
    return {
      contentSets(): {[content: string]: boolean} {
        const {settings, multiplayer} = getState();
        const result: any = {};
        for (const cs of [...getContentSets(settings, multiplayer)]) {
          result[cs] = true;
        }
        return result;
      },
      numAdventurers(): number {
        return numAdventurers(getState().settings, getState().multiplayer);
      },
      viewCount(id: string): number {
        return this.views[id] || 0;
      },
      ...templateScope(),
    };
  };

  // Caution: Scope is the API for Quest Creators.
  // New endpoints should be added carefully b/c we'll have to support them.
  // Behind-the-scenes data can be added to the context outside of scope
  const newContext: TemplateContext = {
    _templateScopeFn: populateScopeFn, // Used to refill template scope elsewhere (without dependencies)
    path: ([] as any),
    scope: {
      _: populateScopeFn(),
    },
    templates: {
      combat: EMPTY_COMBAT_STATE,
      decision: EMPTY_DECISION_STATE,
    },
    views: {},
  };

  for (const k of Object.keys(newContext.scope._)) {
    newContext.scope._[k] = (newContext.scope._[k] as any).bind(newContext);
  }

  // Update random seed
  newContext.seed = generateSeed();

  return newContext;
}
