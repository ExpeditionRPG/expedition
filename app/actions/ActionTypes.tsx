import Redux from 'redux'
import {CardState, CardName, SettingNameType, SearchPhase, SearchSettings, SettingsType, TransitionType, UserState, XMLElement} from '../reducers/StateTypes'

import {QuestContext, QuestDetails, Enemy, CombatPhaseNameType, DifficultyType} from '../reducers/QuestTypes'
import {CombatResult} from '../parser/Handlers'
import {ParserNode} from '../parser/Node'

export interface NavigateAction extends Redux.Action {
  type: 'NAVIGATE';
  to: CardState;
};

export interface ReturnAction extends Redux.Action {
  type: 'RETURN';
  to: CardState;
  before: boolean;
};

export interface QuestNodeAction extends Redux.Action {
  type: 'QUEST_NODE';
  node: ParserNode;
  details?: QuestDetails;
}

export interface ChangeSettingsAction extends Redux.Action {
  type: 'CHANGE_SETTINGS';
  settings: any;
}

export interface InitCombatAction extends Redux.Action {
  type: 'INIT_COMBAT';
  numPlayers: number;
  difficulty: DifficultyType;
  result: CombatResult;
  node?: ParserNode;
}

export interface CombatTimerStopAction extends Redux.Action {
  type: 'COMBAT_TIMER_STOP';
  elapsedMillis: number;
  settings: SettingsType;
}

export interface CombatDefeatAction extends Redux.Action {
  type: 'COMBAT_DEFEAT';
}

export interface CombatVictoryAction extends Redux.Action {
  type: 'COMBAT_VICTORY';
  numPlayers: number;
  maxTier: number;
}

export interface UserFeedbackChangeAction extends Redux.Action {
  type: 'USER_FEEDBACK_CHANGE';
  userFeedback: any;
}

export interface UserFeedbackClearAction extends Redux.Action {
  type: 'USER_FEEDBACK_CLEAR';
}

export interface TierSumDeltaAction extends Redux.Action {
  type: 'TIER_SUM_DELTA';
  delta: number;
}

export interface AdventurerDeltaAction extends Redux.Action {
  type: 'ADVENTURER_DELTA';
  delta: number;
  numPlayers: number;
}

export interface SearchResponseAction extends Redux.Action {
  type: 'SEARCH_RESPONSE';
  quests: QuestDetails[];
  nextToken: string;
  receivedAt: number;
  search: SearchSettings;
}

export interface ViewQuestAction extends Redux.Action {
  type: 'VIEW_QUEST';
  quest: QuestDetails;
}

export interface UserLoginAction extends Redux.Action {
  type: 'USER_LOGIN';
  user: UserState;
}

export interface UserLogoutAction extends Redux.Action {
  type: 'USER_LOGOUT';
}

export interface QuestCardAction {}
