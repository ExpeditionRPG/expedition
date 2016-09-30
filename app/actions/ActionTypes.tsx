import {CardActionType, QuestType, SettingNameType, DialogIDType} from '../reducers/StateTypes'

export const NAVIGATE = 'NAVIGATE';
export interface NavigateAction {
  type: 'NAVIGATE';
  to: CardActionType;
};

export const RETURN = 'RETURN';
export interface ReturnAction {
  type: 'RETURN';
};

export const CHOICE = 'CHOICE';
export interface ChoiceAction {
  type: 'CHOICE';
  result: any;
  node: string;
};

export const CHANGE_SETTING = 'CHANGE_SETTING';
export interface ChangeSettingAction {
  type: 'CHANGE_SETTING';
  name: SettingNameType;
  value: any;
}

export const START_COMBAT = 'START_COMBAT';

export const END_COMBAT = 'STOP_COMBAT';

export const REQUEST_QUEST_LOAD: string = 'REQUEST_QUEST_LOAD';
export interface RequestQuestLoadAction extends Redux.Action {
  type: 'REQUEST_QUEST_LOAD';
  url: string;
}

export const RECEIVE_QUEST_XML: string = 'RECEIVE_QUEST_XML';
export interface ReceiveQuestXMLAction extends Redux.Action {
  type: 'RECEIVE_QUEST_XML';
  xml: any;
}


export const REQUEST_QUEST_SEARCH: string = 'REQUEST_QUEST_SEARCH';
export interface RequestQuestSearchAction extends Redux.Action {
  type: 'REQUEST_QUEST_SEARCH';
}

export const RECEIVE_QUEST_SEARCH: string = 'RECEIVE_QUEST_SEARCH';
export interface ReceiveQuestSearchAction extends Redux.Action {
  type: 'RECEIVE_QUEST_SEARCH';
  quests: QuestType[];
  nextToken: string;
  receivedAt: number;
}

export const SET_DIALOG: string = 'SET_DIALOG';
export interface SetDialogAction extends Redux.Action {
  type: 'SET_DIALOG';
  dialog: DialogIDType;
  shown: boolean;
}