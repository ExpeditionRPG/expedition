import Redux from 'redux';
import * as semver from 'semver';
import {handleFetchErrors} from 'shared/requests';
import {VERSION} from 'shared/schema/Constants';
import {AUTH_SETTINGS, URLS} from '../Constants';
import {getDevicePlatform} from '../Globals';
import {logEvent} from '../Logging';
import {ServerStatusState} from '../reducers/StateTypes';
import {FetchServerStatusResponse, ServerStatusSetAction} from './ActionTypes';

const fetchRetry = require('fetch-retry')(fetch);

export function fetchServerStatus(log: any = logEvent) {
  return (dispatch: Redux.Dispatch<any>): any => {
    return fetchRetry(AUTH_SETTINGS.URL_BASE + '/announcements', {
      retries: 2,
      retryDelay: 1000,
    })
    .then(handleFetchErrors)
    .then((response: Response) => response.json())
    .then((data: FetchServerStatusResponse) => {
      dispatch(handleServerStatus(data));
    }).catch((error: Error) => {
      dispatch(setServerStatus({
        announcement: {
          open: true,
          message: 'Please try again in a few minutes. If the issue persists, you can contact support at contact@fabricate.io',
        },
        isLatestAppVersion: false,
        serverOffline: true,
      }));
      log('error', 'status_fetch_err', {label: error});
    });
  };
}

function handleServerStatus(data: FetchServerStatusResponse) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const newVersion = data.versions[getDevicePlatform()];
    const oldVersion = VERSION;
    const isLatestAppVersion = semver.valid(newVersion) && semver.valid(oldVersion) && semver.lte(newVersion, oldVersion) || false;
    if (!isLatestAppVersion) {
      console.warn('Version mismatch with server:', oldVersion, 'local vs server', newVersion);
    }
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
    } else {
      dispatch(setServerStatus({isLatestAppVersion}));
    }
  };
}

export function setServerStatus(delta: Partial<ServerStatusState>): ServerStatusSetAction {
  return {type: 'SERVER_STATUS_SET', delta};
}
