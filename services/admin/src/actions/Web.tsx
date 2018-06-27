import Redux from 'redux'
import {
  FeedbackQuery,
  FeedbackMutation,
  FeedbackEntry,
  QuestQuery,
  QuestMutation,
  QuestEntry,
  UserQuery,
  UserMutation,
  UserEntry,
  Response as APIResponse
} from 'api/admin/QueryTypes'
import {UpdateFeedbackAction, UpdateQuestAction, UpdateUserAction, QueryErrorAction} from './ActionTypes'
import {authSettings} from '../Constants'

function maybeParse(r: Response) {
  if (!r.ok) {
    return r.json().then((r: any) => {throw Error(r.error || 'Server Error');});
  }
  return r.json();
}

export function feedbackQuery(q: FeedbackQuery) {
  return (dispatch: Redux.Dispatch<any>) => {
    fetch(authSettings.urlBase + '/admin/feedback/query', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(q),
    })
    .then((response: Response) => {
      return maybeParse(response);
    }).then((entries: FeedbackEntry[]) => {
      dispatch({type: 'SET_VIEW_FEEDBACK', entries});
    }).catch((error: Error) => {
      console.error('Request failed', error);
      dispatch({type: 'QUERY_ERROR', view: 'FEEDBACK', error} as QueryErrorAction);
    });
  };
}

export function questsQuery(q: QuestQuery) {
  return (dispatch: Redux.Dispatch<any>) => {
    fetch(authSettings.urlBase + '/admin/quest/query', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(q),
    })
    .then((response: Response) => {
      return maybeParse(response);
    }).then((entries: QuestEntry[]) => {
      dispatch({type: 'SET_VIEW_QUESTS', entries});
    }).catch((error: Error) => {
      console.error('Request failed', error);
      dispatch({type: 'QUERY_ERROR', view: 'QUESTS', error} as QueryErrorAction);
    });
  };
}


export function usersQuery(q: UserQuery) {
  return (dispatch: Redux.Dispatch<any>) => {
    fetch(authSettings.urlBase + '/admin/user/query', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(q),
    })
    .then((response: Response) => {
      return maybeParse(response);
    }).then((entries: UserEntry[]) => {
      dispatch({type: 'SET_VIEW_USERS', entries: entries.map((e: UserEntry) => {
        return {...e, last_login: new Date(e.last_login.toString())};
      })});
    }).catch((error: Error) => {
      console.error('Request failed', error);
      dispatch({type: 'QUERY_ERROR', view: 'USERS', error} as QueryErrorAction);
    });
  };
}

export function mutateFeedback(m: FeedbackMutation) {
  return (dispatch: Redux.Dispatch<any>) => {
    fetch(authSettings.urlBase + '/admin/feedback/modify', {
       method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(m),
    })
    .then((response: Response) => {
      return maybeParse(response);
    }).then((response: APIResponse) => {
      if (response.status !== 'OK') {
        throw Error(response.error);
      }

      dispatch({type: 'UPDATE_FEEDBACK', m} as UpdateFeedbackAction);
    }).catch((error: Error) => {
      console.error('Request failed', error);
      dispatch({type: 'QUERY_ERROR', view: 'FEEDBACK', error} as QueryErrorAction);
    });
  };
}

export function mutateQuest(m: QuestMutation) {
  return (dispatch: Redux.Dispatch<any>) => {
    fetch(authSettings.urlBase + '/admin/quest/modify', {
       method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(m),
    })
    .then((response: Response) => {
      return maybeParse(response);
    }).then((response: APIResponse) => {
      if (response.status !== 'OK') {
        throw Error(response.error);
      }

      dispatch({type: 'UPDATE_QUEST', m} as UpdateQuestAction);
    }).catch((error: Error) => {
      console.error('Request failed', error);
      dispatch({type: 'QUERY_ERROR', view: 'QUESTS', error} as QueryErrorAction);
    });
  };
}

export function mutateUser(m: UserMutation) {
  return (dispatch: Redux.Dispatch<any>) => {
    fetch(authSettings.urlBase + '/admin/user/modify', {
       method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(m),
    })
    .then((response: Response) => {
      return maybeParse(response);
    }).then((response: APIResponse) => {
      if (response.status !== 'OK') {
        throw Error(response.error);
      }

      dispatch({type: 'UPDATE_USER', m} as UpdateUserAction);
    }).catch((error: Error) => {
      console.error('Request failed', error);
      dispatch({type: 'QUERY_ERROR', view: 'USERS', error} as QueryErrorAction);
    });
  };
}
