import {AppStateWithHistory, CardState, CardThemeType} from 'app/reducers/StateTypes';
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
import VictoryContainer from './combat/VictoryContainer';
import {initDecision} from './decision/Actions';
import DecisionTimerContainer from './decision/DecisionTimerContainer';
import PrepareDecisionContainer from './decision/PrepareDecisionContainer';
import ResolveDecisionContainer from './decision/ResolveDecisionContainer';
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

export function renderCardTemplate(card: CardState, node: ParserNode): JSX.Element {
  const phase = card.phase || 'ROLEPLAY';
  switch (phase) {
    case 'ROLEPLAY':
      return <RoleplayContainer node={node}/>;
    case 'PREPARE_DECISION':
      return <PrepareDecisionContainer node={node}/>;
    case 'DECISION_TIMER':
      return <DecisionTimerContainer node={node}/>;
    case 'RESOLVE_DECISION':
      return <ResolveDecisionContainer node={node}/>;
    case 'DRAW_ENEMIES':
      return <DrawEnemiesContainer node={node}/>;
    case 'PREPARE':
      return <PrepareTimerContainer node={node}/>;
    case 'TIMER':
      return <TimerCardContainer node={node}/>;
    case 'SURGE':
      return <SurgeContainer node={node}/>;
    case 'RESOLVE_ABILITIES':
      return <ResolveContainer node={node}/>;
    case 'RESOLVE_DAMAGE':
      return <PlayerTierContainer node={node}/>;
    case 'VICTORY':
      return <VictoryContainer node={node}/>;
    case 'DEFEAT':
      return <DefeatContainer node={node}/>;
    case 'NO_TIMER':
      return <NoTimerContainer node={node}/>;
    case 'MID_COMBAT_ROLEPLAY':
      return <MidCombatRoleplayContainer node={node}/>;
    case 'MID_COMBAT_DECISION':
      const combat = node.ctx.templates.combat;
      return renderCardTemplate({...card, phase: ((combat) ? combat.decisionPhase : 'PREPARE_DECISION')}, node);
    default:
      throw new Error('Unknown template for card phase ' + card.phase);
  }
}

export function getCardTemplateTheme(card: CardState): CardThemeType {
  switch (card.phase || 'ROLEPLAY') {
    case 'DRAW_ENEMIES':
    case 'PREPARE':
    case 'TIMER':
    case 'SURGE':
    case 'RESOLVE_ABILITIES':
    case 'RESOLVE_DAMAGE':
    case 'VICTORY':
    case 'DEFEAT':
    case 'NO_TIMER':
    case 'MID_COMBAT_ROLEPLAY':
    case 'MID_COMBAT_DECISION':
      return 'dark';
    case 'ROLEPLAY':
    case 'PREPARE_DECISION':
    case 'DECISION_TIMER':
    case 'RESOLVE_DECISION':
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
        const settings = getState().settings;
        return settings && settings.contentSets;
      },
      numAdventurers(): number {
        const settings = getState().settings;
        return settings && settings.numPlayers;
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
    templates: {},
    views: {},
  };

  for (const k of Object.keys(newContext.scope._)) {
    newContext.scope._[k] = (newContext.scope._[k] as any).bind(newContext);
  }

  // Update random seed
  newContext.seed = generateSeed();

  return newContext;
}
