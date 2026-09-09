import { publishQuest, questMetadataChange } from '../actions/Quest';
import { mapDispatchToProps, mapStateToProps } from './DialogsContainer';

jest.mock('../actions/Quest', () => ({
  publishQuest: jest.fn(() => ({ type: 'TEST_PUBLISH' })),
  questMetadataChange: jest.fn(() => ({ type: 'TEST_METADATA' })),
}));

describe('DialogsContainer', () => {
  test('maps dialogs, quest and user without rewriting state', () => {
    const state: any = {
      dialogs: { open: {} },
      quest: { id: 'q' },
      user: { name: 'Tester' },
    };
    expect(mapStateToProps(state)).toEqual(state);
  });
  test('closes the requested dialog', () => {
    const dispatch = jest.fn();
    mapDispatchToProps(dispatch).onClose('ERROR');
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_DIALOG',
      dialog: 'ERROR',
      shown: false,
      annotations: undefined,
    });
  });
  // Save confirmations and sign-in/out dialogs have been removed; autosave and the appbar own them.
  test('saves metadata live and requires Horror when Future is selected', () => {
    const dispatch = jest.fn();
    const quest = { id: 'q' };
    mapDispatchToProps(dispatch).handleMetadataChange(quest, {
      expansionfuture: true,
    });
    expect(questMetadataChange).toHaveBeenCalledWith(quest, {
      expansionfuture: true,
      expansionhorror: true,
    });
    expect(dispatch).toHaveBeenCalledWith({ type: 'TEST_METADATA' });
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
