import {RECEIVE_QUEST_LOAD, NEW_QUEST, RECEIVE_QUEST_DELETE, RECEIVE_QUEST_PUBLISH} from '../ActionTypes'

export function quest(state = {id: null, url: null, last_save: null, short_url: null}, action) {
  switch(action.type) {
    case RECEIVE_QUEST_LOAD:
      return {
        id: action.id,
        url: action.url,
        last_save: action.last_save,
        short_url: action.short_url
      };
    case NEW_QUEST:
    case RECEIVE_QUEST_DELETE:
      return {id: null, url: null, last_save: null, short_url: null};
    case RECEIVE_QUEST_PUBLISH:
      return {...state, short_url: action.short_url};
    default:
      return state;
  }
}