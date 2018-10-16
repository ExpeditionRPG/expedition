import Redux from 'redux';
import * as semver from 'semver';
import {handleFetchErrors} from 'shared/requests';
import {AUTH_SETTINGS, URLS, VERSION} from '../Constants';
import {getDevicePlatform} from '../Globals';
import {logEvent} from '../Logging';
import {ServerStatusState} from '../reducers/StateTypes';
import {FetchServerStatusResponse, ServerStatusSetAction} from './ActionTypes';

export function fetchServerStatus(log: any = logEvent) {
  return (dispatch: Redux.Dispatch<any>): any => {
    return fetch(AUTH_SETTINGS.URL_BASE + '/announcements')
      .then(handleFetchErrors)
      .then((response: Response) => response.json())
      .then((data: FetchServerStatusResponse) => {
        dispatch(handleServerStatus(data));
      }).catch((error: Error) => {
        // Don't alert user - it's not important to them if this fails
        log('error', 'status_fetch_err', {label: error});
      });
  };
}

function handleServerStatus(data: FetchServerStatusResponse) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const newVersion = data.versions[getDevicePlatform()];
    const oldVersion = VERSION;
    const isLatestAppVersion = semver.valid(newVersion) && semver.valid(oldVersion) && semver.lte(newVersion, oldVersion) || false;

    if (data.message !== null && data.message !== '') {
      dispatch(setServerStatus({
        announcement: {
          open: true,
          message: data.message,
          link: data.link,
        },
        isLatestAppVersion,
      }));
    } else if (!isLatestAppVersion) {
      dispatch(setServerStatus({
        announcement: {
          open: true,
          message: 'New version available, click here to upgrade',
          link: URLS[getDevicePlatform()],
        },
        isLatestAppVersion,
      }));
    }
  };
}

export function setServerStatus(delta: Partial<ServerStatusState>): ServerStatusSetAction {
  return {type: 'SERVER_STATUS_SET', delta};
}
