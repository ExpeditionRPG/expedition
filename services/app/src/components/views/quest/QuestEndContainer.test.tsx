jest.mock('app/actions/Web', () => ({
  submitUserFeedback: jest.fn(() => ({ type: 'TEST_FEEDBACK' })),
}));
import { mapDispatchToProps } from './QuestEndContainer';
import { submitUserFeedback } from 'app/actions/Web';
import { TUTORIAL_QUESTS } from 'app/Constants';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { initialSettings } from 'app/reducers/Settings';
import { loggedOutUser } from 'shared/auth/UserState';

beforeEach(() => jest.clearAllMocks());
// Guest ratings and rating-only submissions are supported. The former login
// and minimum-text stubs predated the current structured review form.
test('accepts guest rating-only feedback without forcing authentication', () => {
  const dispatch = jest.fn();
  const props = mapDispatchToProps(dispatch);
  props.onSubmit(
    { details: TUTORIAL_QUESTS[0] },
    initialSettings,
    loggedOutUser,
    initialMultiplayer,
    true,
    '',
    5,
  );
  expect(submitUserFeedback).toHaveBeenCalledWith(
    expect.objectContaining({
      user: loggedOutUser,
      anonymous: true,
      text: '',
      rating: 5,
      type: 'rating',
    }),
  );
});
test('leaving without a rating sends no empty review', () => {
  const props = mapDispatchToProps(jest.fn());
  props.onSubmit(
    { details: TUTORIAL_QUESTS[0] },
    initialSettings,
    loggedOutUser,
    initialMultiplayer,
    true,
    '',
    null,
  );
  expect(submitUserFeedback).not.toHaveBeenCalled();
});
