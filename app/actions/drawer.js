import {RECEIVE_QUEST_LIST, REQUEST_QUEST_LIST, SET_DRAWER} from '../ActionTypes'

function receiveQuestList(json) {
  return {
    type: RECEIVE_QUEST_LIST,
    quests: json.quests,
    nextToken: json.nextToken,
    receivedAt: Date.now()
  };
}
function fetchQuestList(dispatch) {
  dispatch({type: REQUEST_QUEST_LIST});
  return $.get("/quests/0").done(data => dispatch(receiveQuestList(JSON.parse(data)))); // TODO: Add fail
}

export function setDrawer(is_open) {
  return dispatch => {
    dispatch({type: SET_DRAWER, is_open});
    if (is_open) {
      return $.get("/quests/0").done(data => dispatch(receiveQuestList(JSON.parse(data)))); // TODO: Add fail
    }
  }
}

export function setDrawer(is_open) {
  return dispatch => {
    dispatch({type: SET_DRAWER, is_open});
    if (is_open) {
      return fetchQuestList(dispatch);
    }
  }
}