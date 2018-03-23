import * as Redux from 'redux'
import {SearchResponseAction, ViewQuestAction} from './ActionTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {SearchSettings} from '../reducers/StateTypes'
import {remoteify} from './ActionTypes'
import {authSettings, FEATURED_QUESTS} from '../Constants'
import {toCard} from './Card'
import {openSnackbar} from '../actions/Snackbar'

export const viewQuest = remoteify(function viewQuest(a: {quest: QuestDetails}, dispatch: Redux.Dispatch<any>) {
  dispatch({type: 'VIEW_QUEST', quest: a.quest});
  dispatch(toCard({name: 'SEARCH_CARD', phase: 'DETAILS'}));
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

  dispatch(getSearchResults(params, (quests: QuestDetails[], response: any) => {
    dispatch({
      type: 'SEARCH_RESPONSE',
      quests: quests,
      nextToken: response.nextToken,
      receivedAt: response.receivedAt,
      search: params,
    } as SearchResponseAction);
    if (params.partition === 'expedition-private') {
      dispatch(toCard({name: 'SEARCH_CARD', phase: 'PRIVATE'}));
    } else {
      dispatch(toCard({name: 'SEARCH_CARD', phase: 'SEARCH'}));
    }
  }));

  return a;
});

export const searchAndPlay = remoteify(function searchAndPlay(id: string, dispatch: Redux.Dispatch<any>) {
  const params = {
    id,
    partition: 'expedition-public',
  } as SearchSettings;
  const featuredQuest = FEATURED_QUESTS.filter((q: QuestDetails) => q.id === id);
  if (featuredQuest.length === 1) {
    dispatch(viewQuest({quest: featuredQuest[0]}));
  } else {
    dispatch(getSearchResults(params, (quests: QuestDetails[], response: any) => {
      dispatch({
        type: 'SEARCH_RESPONSE',
        quests: quests,
        nextToken: response.nextToken,
        receivedAt: response.receivedAt,
        search: {}, // Don't specify search params because this one's weird and uses ID
      } as SearchResponseAction);
      if (quests.length === 0) {
        // TODO better alert / failure UI (dialog)
        // https://github.com/ExpeditionRPG/expedition-app/issues/625
        alert('Quest not found, returning to home screen.');
        dispatch(toCard({name: 'SPLASH_CARD'}));
      } else {
        dispatch(viewQuest({quest: quests[0]}));
      }
    }));
  }
  return params;
});

function getSearchResults(params: SearchSettings, callback: (quests: QuestDetails[], response: any)=>void) {
  return (dispatch: Redux.Dispatch<any>) => {
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
      callback(quests, response);
    };
    xhr.onerror = () => {
      dispatch(openSnackbar('Network error: Please check your connection.'));
    }
    xhr.withCredentials = true;
    xhr.send(JSON.stringify(params));
  }
}
