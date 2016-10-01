import {CardState, SettingNameType, XMLElement, TransitionType} from '../reducers/StateTypes'
import {QuestDetails, Enemy, CombatPhaseNameType} from '../reducers/QuestTypes'

export interface NavigateAction {
  type: 'NAVIGATE';
  to: CardState;
  phase?: CombatPhaseNameType;
};

export interface ReturnAction {
  type: 'RETURN';
  before?: string;
};

export interface InitQuestAction {
  type: 'INIT_QUEST';
  node: XMLElement;
}

export interface ChoiceAction {
  type: 'CHOICE';
  choice: number;
};

export interface EventAction {
  type: 'EVENT';
  event: string;
}

export interface ChangeSettingAction {
  type: 'CHANGE_SETTING';
  name: SettingNameType;
  value: any;
}

export interface InitCombatAction {
  type: 'INIT_COMBAT';
  numPlayers: number;
  enemies: Enemy[];
}

export interface CombatTimerStopAction {
  type: 'COMBAT_TIMER_STOP';
  elapsedMillis: number;
}

export interface RequestQuestSearchAction extends Redux.Action {
  type: 'REQUEST_QUEST_SEARCH';
}

export interface ReceiveQuestSearchAction extends Redux.Action {
  type: 'RECEIVE_QUEST_SEARCH';
  quests: QuestDetails[];
  nextToken: string;
  receivedAt: number;
}

export interface QuestCardAction {}