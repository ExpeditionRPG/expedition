import Redux from 'redux'
import {AnnouncementSetAction} from './ActionTypes'
import {authSettings} from '../Constants'
import {logEvent} from '../Main'

export function fetchAnnouncements() {
  return (dispatch: Redux.Dispatch<any>): any => {
    fetch(authSettings.urlBase + '/announcements', {
      method: 'GET',
    })
    .then((response: Response) => {
      return response.json();
    })
    .then((data: any) => {
      if (data !== null && data.message !== null) {
        dispatch(setAnnouncement(true, data.message, data.link));
      }
    }).catch((error: Error) => {
      // Don't alert user - it's not important to them if this fails
      logEvent('announcement_fetch_err', error);
    });
  };
}

export function setAnnouncement(open: boolean, message?: string, link?: string): AnnouncementSetAction {
  return {type: 'ANNOUNCEMENT_SET', open, message, link};
}
