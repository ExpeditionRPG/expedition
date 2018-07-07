import * as Redux from 'redux';
import {openSnackbar} from '../actions/Snackbar';
import {AUTH_SETTINGS, FEATURED_QUESTS} from '../Constants';
import {QuestDetails} from '../reducers/QuestTypes';
import {CardPhase, ExpansionsType, SearchSettings, SettingsType} from '../reducers/StateTypes';
import {SearchResponseAction} from './ActionTypes';
import {remoteify} from './ActionTypes';
import {toCard} from './Card';
import {previewQuest} from './Quest';

// TODO: Make search options propagate to other clients
export const search = remoteify(function search(a: {search: SearchSettings, settings: SettingsType}, dispatch: Redux.Dispatch<any>) {
  const params = {...a.search};
  Object.keys(params).forEach((key: string) => {
    if ((params as any)[key] === null) {
      delete (params as any)[key];
    }
  });
  params.players = a.settings.numPlayers;
  const dispatchPhase = (params.partition === 'expedition-private') ? 'PRIVATE' : 'SEARCH';
  params.expansions = Object.keys(a.settings.contentSets).filter( (key) => a.settings.contentSets[key] ) as ExpansionsType[],
  dispatch(toCard({name: 'SEARCH_CARD', phase: dispatchPhase as CardPhase}));
  dispatch(getSearchResults(params, (quests: QuestDetails[], response: any) => {
    dispatch({
      nextToken: response.nextToken,
      quests,
      receivedAt: response.receivedAt,
      search: params,
      type: 'SEARCH_RESPONSE',
    } as SearchResponseAction);
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
    dispatch(previewQuest({quest: featuredQuest[0]}));
  } else {
    dispatch(getSearchResults(params, (quests: QuestDetails[], response: any) => {
      dispatch({
        nextToken: response.nextToken,
        quests,
        receivedAt: response.receivedAt,
        search: {}, // Don't specify search params because this one's weird and uses ID
        type: 'SEARCH_RESPONSE',
      } as SearchResponseAction);
      if (quests.length === 0) {
        // TODO better alert / failure UI (dialog)
        // https://github.com/ExpeditionRPG/expedition-app/issues/625
        alert('Quest not found, returning to home screen.');
        dispatch(toCard({name: 'SPLASH_CARD'}));
      } else {
        dispatch(previewQuest({quest: quests[0]}));
      }
    }));
  }
  return params;
});

// TODO switch to fetch since this never loads local files
function getSearchResults(params: SearchSettings, callback: (quests: QuestDetails[], response: any) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
    // Clear previous results
    dispatch({type: 'SEARCH_REQUEST'});

    const xhr = new XMLHttpRequest();
    // TODO: Pagination / infinite scrolling
    xhr.open('POST', AUTH_SETTINGS.URL_BASE + '/quests', true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onload = () => {
      const response: any = JSON.parse(xhr.responseText);
      if (response.error) {
        dispatch({type: 'SEARCH_ERROR'});
        return dispatch(openSnackbar(Error('Search error: ' + response.error)));
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
      dispatch(openSnackbar(Error('Network error: Please check your connection.')));
    };
    xhr.withCredentials = true;
    xhr.send(JSON.stringify(params));
  };
}
