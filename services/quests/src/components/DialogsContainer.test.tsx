import { publishQuest } from '../actions/Quest';
import { mapDispatchToProps } from './DialogsContainer';

jest.mock('../actions/Quest', () => ({
  publishQuest: jest.fn(() => ({ type: 'TEST_PUBLISH' })),
  questMetadataChange: jest.fn(),
}));

describe('DialogsContainer', () => {
  test.skip('maps state', () => {
    /* TODO */
  });

  test.skip('dispatches dialog change with onClose', () => {
    /* TODO */
  });

  test.skip('saves with onConfirmSave(true) and dispatches', () => {
    /* TODO */
  });

  test.skip('forces "new quest" action with onConfirmSave(false)', () => {
    /* TODO */
  });

  test.skip('forces "load quest" action with onConfirmSave(false)', () => {
    /* TODO */
  });

  test.skip('dispatches with onSignIn', () => {
    /* TODO */
  });

  test.skip('dispatches with onSignOut', () => {
    /* TODO */
  });

  test.skip('Saves metadata changes live', () => {
    /* TODO */
  });

  describe('publishing metadata validation', () => {
    const quest = {
      title: 'A valid quest',
      author: 'Quest Author',
      summary: 'An adventure for everyone.',
      email: 'author@example.com',
      minplayers: 1,
      maxplayers: 6,
      mintimeminutes: 15,
      maxtimeminutes: 60,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    });

    afterEach(() => jest.restoreAllMocks());

    test('publishes valid metadata without a schema dependency cycle', () => {
      const dispatch = jest.fn();
      mapDispatchToProps(dispatch).onRequestPublish(quest, true, false);

      expect(window.alert).not.toHaveBeenCalled();
      expect(publishQuest).toHaveBeenCalledWith(quest, true, false);
      expect(dispatch).toHaveBeenCalledWith({ type: 'TEST_PUBLISH' });
    });

    test.each([
      { minplayers: 4, maxplayers: 2 },
      { mintimeminutes: 60, maxtimeminutes: 15 },
      { minplayers: 0 },
      { mintimeminutes: 0 },
      { maxplayers: 7 },
      { maxtimeminutes: 1000 },
    ])('rejects invalid range %j', invalid => {
      const dispatch = jest.fn();
      mapDispatchToProps(dispatch).onRequestPublish(
        { ...quest, ...invalid },
        false,
        false,
      );

      expect(window.alert).toHaveBeenCalledTimes(1);
      expect(publishQuest).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
