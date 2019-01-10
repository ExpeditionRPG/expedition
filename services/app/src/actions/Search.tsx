import { QuestSearchResponse } from 'api/Handlers';
import * as Redux from 'redux';
import { handleFetchErrors } from 'shared/requests';
import { Partition } from 'shared/schema/Constants';
import { Quest } from 'shared/schema/Quests';
import { openSnackbar } from '../actions/Snackbar';
import { AUTH_SETTINGS, TUTORIAL_QUESTS } from '../Constants';
import { remoteify } from '../multiplayer/Remoteify';
import { SearchParams, SettingsType } from '../reducers/StateTypes';
import { SearchChangeParamsAction, SearchResponseAction } from './ActionTypes';
import {} from './ActionTypes';
import { toCard } from './Card';
import { previewQuest } from './Quest';

export const changeSearchParams = remoteify(function changeSearchParams(a: {params: Partial<SearchParams>}, dispatch: Redux.Dispatch<any>) {
  dispatch({type: 'SEARCH_CHANGE_PARAMS', params: a.params} as SearchChangeParamsAction);
  return a;
});

export function fetchSearchResults(params: SearchParams): Promise<QuestSearchResponse> {
  return fetch(AUTH_SETTINGS.URL_BASE + '/quests', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(params),
    })
    .then(handleFetchErrors)
    .then((response: Response) => response.json())
    .then((data: QuestSearchResponse) => {
      // Simple validation of response quests
      const quests: Quest[] = [];
      if (data.quests) {
        for (const q of data.quests) {
          const i = Quest.create(q);
          if (i instanceof Error) {
            console.error('Parsed invalid quest: ' + JSON.stringify(q));
          } else {
            quests.push(i);
          }
        }
      }

      data.quests = quests;
      return data;
    });
}

interface DoSearchParams {
 params: SearchParams;
 players: number;
 settings: SettingsType;
}
export function searchInternal(a: DoSearchParams, dispatch: Redux.Dispatch<any>, fetchResults = fetchSearchResults) {
  const params = { ...a.params };
  Object.keys(params).forEach((key: string) => {
    if ((params as any)[key] === null) {
      delete (params as any)[key];
    }
  });
  params.players = a.players;

  // Clear previous results
  dispatch({ type: 'SEARCH_REQUEST' });

  const promise = fetchResults(params).then((response: QuestSearchResponse) => {
    dispatch({
      quests: response.quests,
      error: response.error,
      params,
      type: 'SEARCH_RESPONSE',
    } as SearchResponseAction);
  }).catch((error: Error) => {
    dispatch(openSnackbar(Error('Network error: Please check your connection.')));
  });

  return {...a, promise};
}

// TODO: Make search options propagate to other clients
export const search = remoteify(function search(
  a: DoSearchParams,
  dispatch: Redux.Dispatch<any>
) {
  return searchInternal(a, dispatch);
});

export function searchAndPlayInternal(id: string, dispatch: Redux.Dispatch<any>, fetchResults = fetchSearchResults) {
  const params = {
    id,
    partition: Partition.expeditionPublic,
  } as SearchParams;
  const featuredQuest = TUTORIAL_QUESTS.filter((q) => q.id === id);

  if (featuredQuest.length === 1) {
    dispatch(previewQuest({ quest: featuredQuest[0] }));
    return params;
  }

  // Clear previous results
  dispatch({ type: 'SEARCH_REQUEST' });

  const promise = fetchResults(params).then((response: QuestSearchResponse) => {
    dispatch({
      quests: response.quests,
      error: response.error,
      params: {}, // Don't specify search params because this one's weird and uses ID
      type: 'SEARCH_RESPONSE',
    } as SearchResponseAction);
    if (response.quests.length === 0) {
      // TODO better alert / failure UI (dialog)
      // https://github.com/ExpeditionRPG/expedition-app/issues/625
      alert('Quest not found, returning to home screen.');
      dispatch(toCard({ name: 'SPLASH_CARD' }));
    } else {
      dispatch(previewQuest({ quest: response.quests[0] }));
    }
  }).catch((error: Error) => {
    dispatch(openSnackbar(Error('Network error: Please check your connection.')));
  });
  return {...params, promise};
}

export const searchAndPlay = remoteify(function searchAndPlay(
  id: string,
  dispatch: Redux.Dispatch<any>
) {
  return searchAndPlayInternal(id, dispatch);
});
