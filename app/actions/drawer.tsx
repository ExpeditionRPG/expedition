import {RECEIVE_QUEST_LIST, REQUEST_QUEST_LIST, SET_DRAWER} from './ActionTypes'

function receiveQuestList(json: {quests: any, nextToken: string}): {type: string, quests: any, nextToken: string, receivedAt: number} {
  return {
    type: RECEIVE_QUEST_LIST,
    quests: json.quests,
    nextToken: json.nextToken,
    receivedAt: Date.now()
  };
}

function fetchQuestList(dispatch: Redux.Dispatch<any>): any {
  dispatch({type: REQUEST_QUEST_LIST});
  return $.get("/quests/0").done((data: string) => dispatch(receiveQuestList(JSON.parse(data)))); // TODO: Add fail
}

export function setDrawer(is_open: boolean): any {
  return (dispatch: Redux.Dispatch<any>) => {
    dispatch({type: SET_DRAWER, is_open});
    if (is_open) {
      return fetchQuestList(dispatch);
    }
  }
}