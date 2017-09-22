import Redux from 'redux'
import * as React from 'react'
import {CardState, SettingsType} from '../reducers/StateTypes'

import {initRoleplay} from './roleplay/Actions'
import RoleplayContainer from './roleplay/RoleplayContainer'

import {initCombat} from './combat/Actions'
import CombatContainer from './combat/CombatContainer'
import {combatScope, CombatState} from './combat/State'
import {CombatPhase} from './combat/Types'

import {updateContext as oldUpdateContext} from 'expedition-qdl/lib/parse/Context'
import {Node} from 'expedition-qdl/lib/parse/Node'
import {TemplateContext} from './TemplateTypes'
import {getStore} from '../Store'

export function initCardTemplate(node: ParserNode, settings: SettingsType) {
  return (dispatch: Redux.Dispatch<any>): any => {
    switch (node.getTag()) {
      case 'roleplay':
        return dispatch(initRoleplay(node, settings));
      case 'combat':
        return dispatch(initCombat(node, settings));
      default:
        throw new Error('Unsupported node type ' + node.getTag());
    }
  }
}

export function renderCardTemplate(card: CardState, node: ParserNode): JSX.Element {
  // Always pass node directly, to prevent jitter to the next card on transition.
  switch(node.getTag()) {
    case 'roleplay':
      return <RoleplayContainer node={node}/>;
    case 'combat':
      return <CombatContainer card={card} node={node}/>;
    default:
      return null;
  }
}

export function templateScope() {
  return combatScope();
}

export function updateContext(node: Cheerio, ctx: TemplateContext, action?: string|number): TemplateContext {
  if (!node) {
    return ctx;
  }

  // Special handling of roleplay node - this is readonly and cannot be cloned.
  let tmpCombatRoleplay: any = null;
  if (ctx.templates && ctx.templates.combat && ctx.templates.combat.roleplay) {
    tmpCombatRoleplay = ctx.templates.combat.roleplay;
    ctx.templates.combat.roleplay = null;
  }

  const newContext = oldUpdateContext(node, ctx, action);

  // Reassign readonly (uncopyable) attributes
  if (tmpCombatRoleplay) {
    newContext.templates.combat.roleplay = tmpCombatRoleplay.clone();
    ctx.templates.combat.roleplay = tmpCombatRoleplay;
  }

  return newContext;
}


export function defaultContext(): TemplateContext {
  const populateScopeFn = function() {
    return {
      contentSets: function(): number {
        const settings = getStore().getState().settings;
        return settings && settings.contentSets;
      },
      numAdventurers: function(): number {
        const settings = getStore().getState().settings;
        return settings && settings.numPlayers;
      },
      viewCount: function(id: string): number {
        return this.views[id] || 0;
      },
      ...templateScope(),
    };
  };

  // Caution: Scope is the API for Quest Creators.
  // New endpoints should be added carefully b/c we'll have to support them.
  // Behind-the-scenes data can be added to the context outside of scope
  const newContext: TemplateContext = {
    scope: {
      _: populateScopeFn(),
    },
    views: {},
    templates: {},
    path: ([] as any),
    _templateScopeFn: populateScopeFn, // Used to refill template scope elsewhere (without dependencies)
  };

  for (const k of Object.keys(newContext.scope._)) {
    newContext.scope._[k] = (newContext.scope._[k] as any).bind(newContext);
  }

  return newContext;
}

export class ParserNode extends Node<TemplateContext>{
  constructor(elem: Cheerio, ctx: TemplateContext, action?: string|number) {
    super(elem, ctx, action);
  }

  protected updateContext(elem: Cheerio, ctx: TemplateContext, action?: string | number): TemplateContext {
    return updateContext(elem, ctx, action);
  }
};
