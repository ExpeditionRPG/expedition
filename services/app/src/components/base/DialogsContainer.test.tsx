import {mapDispatchToProps} from './DialogsContainer';
import {loggedOutUser} from 'shared/auth/UserState';
import {initialSettings} from 'app/reducers/Settings';
import {AUTH_SETTINGS, TUTORIAL_QUESTS} from 'app/Constants';
import {newMockStore} from 'app/Testing';

const fetchMock = require('fetch-mock');

describe('DialogsContainer', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  test.skip('maps state', () => { /* TODO */ });

  describe('DispatchProps', () => {
    function setup() {
      const store = newMockStore({
        user: {
          ...loggedOutUser,
          email: 'test@test.com',
          name: 'Test User',
          loggedIn: true,
        },
      });
      const dispatchProps = mapDispatchToProps(store.dispatch);
      return {store, dispatchProps};
    }
    test.skip('dispatches dialog change with onClose', () => { /* TODO */ });
    test.skip('onFeedbackSubmit validates input', () => { /* TODO */ });

    describe('onExitQuest', () => {
      test('submits feedback if there is any', (done) => {
        const {store, dispatchProps} = setup();
        const matcher = AUTH_SETTINGS.URL_BASE + '/quest/feedback/feedback';
        fetchMock.post(matcher, 200);
        dispatchProps.onExitQuest({details: TUTORIAL_QUESTS[0]}, initialSettings, loggedOutUser, 'test feedback text').then(() => {
          expect(fetchMock.called(matcher)).toEqual(true);
          done();
        }).catch(done.fail);
      });

      test('does not submit feedback if no user feedback', (done) => {
        const {store, dispatchProps} = setup();
        const matcher = AUTH_SETTINGS.URL_BASE + '/quest/feedback/feedback';
        fetchMock.post(matcher, 200);
        dispatchProps.onExitQuest({details: TUTORIAL_QUESTS[0]}, initialSettings, loggedOutUser, '').then(() => {
          expect(fetchMock.called(matcher)).toEqual(false);
          done();
        }).catch(done.fail);
      });
    });
  });

});
