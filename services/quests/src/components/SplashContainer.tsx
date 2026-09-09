import { connect } from 'react-redux';
import Redux from 'redux';
import { UserState } from 'shared/auth/UserState';
import { registerUserAndIdToken } from 'shared/auth/Web';
import { AUTH_SETTINGS } from 'shared/schema/Constants';
import { loadQuestFromURL } from '../actions/Quest';
import { ensureToken, postLoginUser } from '../actions/User';
import { AppState } from '../reducers/StateTypes';
import Splash, { DispatchProps, StateProps } from './Splash';

const ReactGA = require('react-ga');

const mapStateToProps = (state: AppState): StateProps => {
  return {
    announcement: state.announcement,
    user: state.user,
    pendingQuestId: window.location.hash.slice(1),
  };
};

export const mapDispatchToProps = (
  dispatch: Redux.Dispatch<any>,
): DispatchProps => {
  return {
    onLinkTap: (link: string) => {
      if (link !== '') {
        window.open(link + '?utm_source=questcreator', '_system');
      }
    },
    onLogin: (jwt: string) => {
      ReactGA.event({
        action: 'LOGIN',
        category: 'interaction',
        label: 'splashscreen',
      });
      return registerUserAndIdToken(AUTH_SETTINGS.URL_BASE, jwt).then(
        (user: UserState) => {
          dispatch(postLoginUser(user, window.location.hash.slice(1)));
        },
      );
    },
    onOpenQuest: (user: UserState, id: string) => {
      return ensureToken(true).then(() => {
        dispatch(loadQuestFromURL(user, id));
      });
    },
    onNewQuest: (user: UserState) => {
      return ensureToken(true).then(() => {
        window.location.hash = '';
        dispatch(loadQuestFromURL(user));
      });
    },
  };
};

const SplashContainer = connect(mapStateToProps, mapDispatchToProps)(Splash);

export default SplashContainer;
