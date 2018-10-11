import { QuestSearchResponse } from 'api/Handlers';
import * as Redux from 'redux';
import { handleFetchErrors } from 'shared/requests';
import { Quest } from 'shared/schema/Quests';
import { openSnackbar } from '../actions/Snackbar';
import { AUTH_SETTINGS, TUTORIAL_QUESTS } from '../Constants';
import { remoteify } from '../multiplayer/Remoteify';
import { SearchParams, SettingsType } from '../reducers/StateTypes';
import { SearchChangeParamsAction, SearchResponseAction } from './ActionTypes';
import {} from './ActionTypes';
import { toCard } from './Card';
import { previewQuest } from './Quest';

export function changeSearchParams(params: any): SearchChangeParamsAction {
  return { type: 'SEARCH_CHANGE_PARAMS', params };
}

// TODO: Make search options propagate to other clients
export const search = remoteify(function search(
  a: { params: SearchParams; players: number; settings: SettingsType },
  dispatch: Redux.Dispatch<any>
) {
  const params = { ...a.params };
  Object.keys(params).forEach((key: string) => {
    if ((params as any)[key] === null) {
      delete (params as any)[key];
    }
  });
  params.players = a.players;
  dispatch(
    getSearchResults(params, (response: QuestSearchResponse) => {
      dispatch({
        quests: response.quests,
        error: response.error,
        params,
        type: 'SEARCH_RESPONSE',
      } as SearchResponseAction);
    })
  );

  return a;
});

export const searchAndPlay = remoteify(function searchAndPlay(
  id: string,
  dispatch: Redux.Dispatch<any>
) {
  const params = {
    id,
    partition: 'expedition-public',
  } as SearchParams;
  const featuredQuest = TUTORIAL_QUESTS.filter((q) => q.id === id);
  if (featuredQuest.length === 1) {
    dispatch(previewQuest({ quest: featuredQuest[0] }));
  } else {
    dispatch(
      getSearchResults(params, (response: QuestSearchResponse) => {
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
      })
    );
  }
  return params;
});

// TODO switch to fetch since this never loads local files
function getSearchResults(
  params: SearchParams,
  callback: (response: QuestSearchResponse) => void
) {
  return (dispatch: Redux.Dispatch<any>) => {
    // Clear previous results
    dispatch({ type: 'SEARCH_REQUEST' });

    fetch(AUTH_SETTINGS.URL_BASE + '/quests', {
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
        callback(data);
      })
      .catch((error: Error) => {
        // Don't alert user - it's not important to them if this fails
        dispatch(
          openSnackbar(Error('Network error: Please check your connection.'))
        );
      });
  };
}
