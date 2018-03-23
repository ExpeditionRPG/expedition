import Redux from 'redux'
import {FeedbackQuery, FeedbackEntry, QuestQuery, QuestEntry, UserQuery, UserEntry} from 'expedition-api/app/admin/QueryTypes'
import {authSettings} from '../Constants'

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
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json()
    }).then((entries: FeedbackEntry[]) => {
      dispatch({type: 'SET_VIEW_FEEDBACK', entries});
    }).catch((error: Error) => {
      console.error('Request failed', error);
    });
  }
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
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json()
    }).then((entries: QuestEntry[]) => {
      dispatch({type: 'SET_VIEW_QUESTS', entries});
    }).catch((error: Error) => {
      console.error('Request failed', error);
    });
  }
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
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json()
    }).then((entries: UserEntry[]) => {
      dispatch({type: 'SET_VIEW_USERS', entries: entries.map((e: UserEntry) => {
        return {...e, last_login: new Date(e.last_login.toString())};
      })});
    }).catch((error: Error) => {
      console.error('Request failed', error);
    });
  }
}
