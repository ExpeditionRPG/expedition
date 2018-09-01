import {QuestSearchResponse} from 'api/Handlers';
import * as Redux from 'redux';
import {Quest} from 'shared/schema/Quests';
import {openSnackbar} from '../actions/Snackbar';
import {AUTH_SETTINGS, FEATURED_QUESTS} from '../Constants';
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
  dispatch(getSearchResults(params, (response: QuestSearchResponse) => {
    dispatch({
      quests: response.quests,
      error: response.error,
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
  const featuredQuest = FEATURED_QUESTS.filter((q) => q.id === id);
  if (featuredQuest.length === 1) {
    dispatch(previewQuest({quest: featuredQuest[0]}));
  } else {
    dispatch(getSearchResults(params, (response: QuestSearchResponse) => {
      dispatch({
        quests: response.quests,
        error: response.error,
        search: {}, // Don't specify search params because this one's weird and uses ID
        type: 'SEARCH_RESPONSE',
      } as SearchResponseAction);
      if (response.quests.length === 0) {
        // TODO better alert / failure UI (dialog)
        // https://github.com/ExpeditionRPG/expedition-app/issues/625
        alert('Quest not found, returning to home screen.');
        dispatch(toCard({name: 'SPLASH_CARD'}));
      } else {
        dispatch(previewQuest({quest: response.quests[0]}));
      }
    }));
  }
  return params;
});

// TODO switch to fetch since this never loads local files
function getSearchResults(params: SearchSettings, callback: (response: QuestSearchResponse) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
    // Clear previous results
    dispatch({type: 'SEARCH_REQUEST'});

    const xhr = new XMLHttpRequest();
    // TODO: Pagination / infinite scrolling
    xhr.open('POST', AUTH_SETTINGS.URL_BASE + '/quests', true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onload = () => {
      let response: QuestSearchResponse;
      try {
        response = JSON.parse(xhr.responseText);
        if (response.error) {
          throw Error(response.error);
        }
      } catch (e) {
        response = {error: e.toString(), hasMore: false, quests: []};
      }
      // Simple validation of response quests
      const quests: Quest[] = [];
      if (response.quests) {
        for (const q of response.quests) {
          const i = Quest.create(q);
          if (i instanceof Error) {
            console.error('Parsed invalid quest: ' + JSON.stringify(q));
          } else {
            quests.push(i);
          }
        }
      }
      response.quests = quests;
      callback(response);
    };
    xhr.onerror = () => {
      dispatch(openSnackbar(Error('Network error: Please check your connection.')));
    };
    xhr.withCredentials = true;
    xhr.send(JSON.stringify(params));
  };
}
