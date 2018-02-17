import * as Redux from 'redux'
import {SearchResponseAction, ViewQuestAction} from './ActionTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {SearchSettings} from '../reducers/StateTypes'
import {remoteify} from './ActionTypes'
import {authSettings} from '../Constants'
import {toCard} from './Card'
import {openSnackbar} from '../actions/Snackbar'

export const viewQuest = remoteify(function viewQuest(a: {quest: QuestDetails}, dispatch: Redux.Dispatch<any>) {
  dispatch({type: 'VIEW_QUEST', quest: a.quest});
  return a;
});

// TODO: Make search options propagate to other clients
export const search = remoteify(function search(a: SearchSettings, dispatch: Redux.Dispatch<any>) {
  const params = {...a};
  Object.keys(params).forEach((key: string) => {
    if ((params as any)[key] === null) {
      delete (params as any)[key];
    }
  });

  // Clear previous results
  dispatch({type: 'SEARCH_REQUEST'});

  const xhr = new XMLHttpRequest();
  // TODO: Pagination / infinite scrolling
  xhr.open('POST', authSettings.urlBase + '/quests', true);
  xhr.setRequestHeader('Content-Type', 'text/plain');
  xhr.onload = () => {
    const response: any = JSON.parse(xhr.responseText);
    if (response.error) {
      dispatch({type: 'SEARCH_ERROR'});
      return dispatch(openSnackbar('Network error when searching: ' + response.error));
    }

    // Simple validation of response quests
    const quests: QuestDetails[] = [];
    for (const q of response.quests) {
      if (!q.id || !q.title || !q.summary || !q.author || !q.publishedurl) {
        console.error('Parsed invalid quest: ' + JSON.stringify(q));
      } else {
        quests.push(q);
      }
    }

    dispatch({
      type: 'SEARCH_RESPONSE',
      quests: quests,
      nextToken: response.nextToken,
      receivedAt: response.receivedAt,
      search: a,
    } as SearchResponseAction);
    if (a.partition === 'expedition-private') {
      dispatch(toCard({name: 'SEARCH_CARD', phase: 'PRIVATE'}));
    } else {
      dispatch(toCard({name: 'SEARCH_CARD', phase: 'SEARCH'}));
    }
  };
  xhr.onerror = () => {
    dispatch(openSnackbar('Network error: Please check your connection.'));
  }
  xhr.withCredentials = true;
  xhr.send(JSON.stringify(params));

  return a;
});
