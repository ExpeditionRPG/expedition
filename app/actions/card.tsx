import {CardActionType, QuestAction, ListCardType, CardNameType, TransitionType} from '../reducers/StateTypes'
import {NavigateAction, ReturnAction} from './ActionTypes'
import {XMLElement, QuestResult, init, handleEvent, handleChoice, CombatPhase} from '../scripts/QuestParser'

export function navigateTo(card: CardActionType): NavigateAction {
  return {type: 'NAVIGATE', to: card};
}

export function toPrevious(): ReturnAction {
  return {type: 'RETURN'};
}

export function toTestCard(title: string): NavigateAction {
  return navigateTo({name: 'TEST_CARD', title, entry: 'NEXT'});
}

export function toListCard(props: ListCardType): NavigateAction {
  return navigateTo(Object.assign(props, {}, {name: 'LIST_CARD', entry: 'NEXT'}));
}

export function toSplashCard(): NavigateAction {
  return navigateTo({name: 'SPLASH_CARD', entry: 'NEXT'});
}

export function toFeaturedQuests(): NavigateAction {
  return navigateTo({
    name: 'FEATURED_QUESTS',
    entry: 'NEXT',
  });
}

export function toQuestStart(node: XMLElement): NavigateAction {
  return navigateTo({name: 'QUEST_START', node, entry: 'NEXT'});
}

function questResultToAction(result: QuestResult): NavigateAction {
  return navigateTo(Object.assign(result, {}, {entry: 'NEXT'}));
}

export function toFirstQuestCard(node: XMLElement): NavigateAction {
  //.children[0] as XMLElement
  return questResultToAction(init(node));
}

export function handleQuestChoice(node: XMLElement, choice: number): NavigateAction {
  return questResultToAction(handleChoice(node, choice));
}

export function handleQuestEvent(node: XMLElement, event: string): NavigateAction {
  return questResultToAction(handleEvent(node, event));
}

export function toRoleplay(node: XMLElement): NavigateAction {
  return navigateTo({name: 'ROLEPLAY', node, entry: 'NEXT'});
}

export function toCombat(node: XMLElement, phase: CombatPhase): NavigateAction {
  return navigateTo({name: 'COMBAT', node, phase, entry: 'NEXT'});
}