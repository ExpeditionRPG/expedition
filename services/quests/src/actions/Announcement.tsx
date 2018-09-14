import Redux from 'redux';
import {URLS} from '../Constants';
import {AnnouncementSetAction, FetchAnnouncementResponse} from './ActionTypes';
import {handleFetchErrors} from './Web';

export function fetchAnnouncements() {
  return (dispatch: Redux.Dispatch<any>): any => {
    fetch(URLS.ANNOUNCEMENTS)
    .then(handleFetchErrors)
    .then((response: Response) => response.json())
    .then((data: FetchAnnouncementResponse) => {
      dispatch(handleAnnouncements(data));
    }).catch((error: Error) => {
      // Don't do anything - not important if this fails
    });
  };
}

export function handleAnnouncements(data: FetchAnnouncementResponse) {
  return (dispatch: Redux.Dispatch<any>): any => {
    if (data.message !== null && data.message !== '') {
      dispatch(setAnnouncement(true, data.message, data.link));
    }
  };
}

export function setAnnouncement(open: boolean, message?: string, link?: string): AnnouncementSetAction {
  return {type: 'ANNOUNCEMENT_SET', open, message, link};
}
