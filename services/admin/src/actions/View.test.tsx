jest.mock('./Web', () => ({
  usersQuery: jest.fn(() => ({ type: 'TEST_USERS' })),
  questsQuery: jest.fn(() => ({ type: 'TEST_QUESTS' })),
  feedbackQuery: jest.fn(() => ({ type: 'TEST_FEEDBACK' })),
}));
import { queryView, setView } from './View';
import { usersQuery, questsQuery, feedbackQuery } from './Web';
test.each([
  ['USERS', usersQuery, 'last_login', false],
  ['QUESTS', questsQuery, 'created', false],
  ['FEEDBACK', feedbackQuery, 'created', true],
])(
  'queries %s with appropriate default ordering',
  (name, query, column, ascending) => {
    const dispatch = jest.fn();
    queryView(name, 'search')(dispatch);
    expect(query).toHaveBeenCalledWith({
      order: { column, ascending },
      substring: 'search',
    });
    expect(setView(name)).toEqual({ type: 'SET_VIEW', view: name });
    expect(dispatch).toHaveBeenCalledTimes(1);
  },
);
