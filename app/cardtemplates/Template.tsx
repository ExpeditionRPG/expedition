import Redux from 'redux'
import * as React from 'react'
import {ParserNode} from '../parser/Node'
import {CardState, SettingsType} from '../reducers/StateTypes'

import {initRoleplay} from './roleplay/Actions'
import RoleplayContainer from './roleplay/RoleplayContainer'

import {initCombat} from './combat/Actions'
import CombatContainer from './combat/CombatContainer'
import {combatScope, CombatState, CombatPhase} from '../cardtemplates/combat/State'

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

export interface TemplateState {
  combat?: CombatState
}

export type TemplatePhase = CombatPhase;
