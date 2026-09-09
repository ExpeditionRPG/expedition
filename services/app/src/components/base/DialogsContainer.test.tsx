import { AUTH_SETTINGS, TUTORIAL_QUESTS } from 'app/Constants';
import { initialSettings } from 'app/reducers/Settings';
import { newMockStore } from 'app/Testing';
import { loggedOutUser } from 'shared/auth/UserState';
import { mapDispatchToProps, mapStateToProps } from './DialogsContainer';

const fetchMock = require('fetch-mock');

describe('DialogsContainer', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  test('maps state', () => {
    const state = newMockStore({
      quest: { details: TUTORIAL_QUESTS[0], savedTS: 123 },
      user: loggedOutUser,
      settings: initialSettings,
    }).getState();
    const props = mapStateToProps(state);
    expect(props.quest).toBe(state.quest);
    expect(props.user).toBe(state.user);
    expect(props.settings).toBe(state.settings);
    expect(props.selectedSave).toEqual({
      details: TUTORIAL_QUESTS[0],
      ts: 123,
    });
  });

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
      return { store, dispatchProps };
    }
    test('dispatches dialog change with onClose', () => {
      const { store, dispatchProps } = setup();
      dispatchProps.onClose();
      expect(store.getActions()).toContainEqual({
        type: 'DIALOG_SET',
        dialogID: null,
        message: undefined,
      });
    });
    test('onFeedbackSubmit validates input', () => {
      const { store, dispatchProps } = setup();
      const alert = jest
        .spyOn(window, 'alert')
        .mockImplementation(() => undefined);
      for (const text of ['', 'short'])
        dispatchProps.onFeedbackSubmit(
          'feedback',
          { details: TUTORIAL_QUESTS[0] },
          initialSettings,
          loggedOutUser,
          text,
        );
      expect(alert).toHaveBeenCalledTimes(2);
      expect(alert.mock.calls[0][0]).toContain('Please enter a description');
      expect(alert.mock.calls[1][0]).toContain('characters');
      expect(store.getActions()).toEqual([]);
      expect(fetchMock.calls()).toHaveLength(0);
    });

    describe('onExitQuest', () => {
      test('submits feedback if there is any', done => {
        const { store, dispatchProps } = setup();
        const matcher = AUTH_SETTINGS.URL_BASE + '/quest/feedback/feedback';
        fetchMock.post(matcher, 200);
        dispatchProps
          .onExitQuest(
            { details: TUTORIAL_QUESTS[0] },
            initialSettings,
            loggedOutUser,
            'test feedback text',
          )
          .then(() => {
            expect(fetchMock.called(matcher)).toEqual(true);
            done();
          })
          .catch(done);
      });

      test('does not submit feedback if no user feedback', done => {
        const { store, dispatchProps } = setup();
        const matcher = AUTH_SETTINGS.URL_BASE + '/quest/feedback/feedback';
        fetchMock.post(matcher, 200);
        dispatchProps
          .onExitQuest(
            { details: TUTORIAL_QUESTS[0] },
            initialSettings,
            loggedOutUser,
            '',
          )
          .then(() => {
            expect(fetchMock.called(matcher)).toEqual(false);
            done();
          })
          .catch(done);
      });
    });
  });
});
