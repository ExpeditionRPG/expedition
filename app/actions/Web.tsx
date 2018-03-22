import Redux from 'redux'
import {FeedbackQuery, FeedbackEntry} from 'expedition-api/app/admin/QueryTypes'
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
