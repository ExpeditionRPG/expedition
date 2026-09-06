import { defaultView, view } from './View';

const LOGIN = new Date('2018-01-01T00:00:00Z');

function users(): any[] {
  return [
    {
      id: 'u1',
      email: 'alpha@test.com',
      name: 'Alpha',
      loot_points: 5,
      last_login: LOGIN,
    },
    {
      id: 'u2',
      email: 'beta@test.com',
      name: 'Beta',
      loot_points: 3,
      last_login: LOGIN,
    },
  ];
}

function quests(): any[] {
  return [
    {
      id: 'q1',
      partition: 'expedition-public',
      title: 'Public',
      ratingavg: 4,
      ratingcount: 2,
      user: { id: 'u1', email: 'alpha@test.com' },
      published: true,
    },
    {
      id: 'q1',
      partition: 'expedition-private',
      title: 'Private',
      ratingavg: 0,
      ratingcount: 0,
      user: { id: 'u1', email: 'alpha@test.com' },
      published: true,
    },
  ];
}

function feedback(): any[] {
  return [
    {
      partition: 'expedition-public',
      quest: { id: 'q1', title: 'Public' },
      user: { id: 'u1', email: 'alpha@test.com' },
      rating: 5,
      text: 'Great',
      suppressed: false,
    },
    {
      partition: 'expedition-public',
      quest: { id: 'q2', title: 'Other' },
      user: { id: 'u1', email: 'alpha@test.com' },
      rating: 1,
      text: 'Bad',
      suppressed: false,
    },
  ];
}

function state(overrides: any = {}): any {
  return {
    feedback: feedback(),
    filter: '',
    lastQueryError: null,
    quests: quests(),
    selected: { user: null, quest: null, feedback: null },
    users: users(),
    view: 'FEEDBACK',
    ...overrides,
  };
}

describe('view reducer', () => {
  test('returns the default view when given undefined', () => {
    expect(view(undefined, { type: '@@INIT' } as any)).toBe(defaultView);
  });

  test('switches the active view on SET_VIEW', () => {
    const result = view(state(), { type: 'SET_VIEW', view: 'QUESTS' } as any);
    expect(result.view).toEqual('QUESTS');
    expect(result.users).toEqual(users());
  });

  test('replaces entries and clears the last error on SET_VIEW_FEEDBACK', () => {
    const entries = [feedback()[0]];
    const result = view(
      state({ lastQueryError: { view: 'FEEDBACK', error: new Error('boom') } }),
      { type: 'SET_VIEW_FEEDBACK', entries } as any,
    );
    expect(result.feedback).toBe(entries);
    expect(result.lastQueryError).toBeNull();
  });

  test('replaces entries and clears the last error on SET_VIEW_QUESTS', () => {
    const entries = [quests()[0]];
    const result = view(
      state({ lastQueryError: { view: 'QUESTS', error: new Error('boom') } }),
      { type: 'SET_VIEW_QUESTS', entries } as any,
    );
    expect(result.quests).toBe(entries);
    expect(result.lastQueryError).toBeNull();
  });

  test('replaces entries and clears the last error on SET_VIEW_USERS', () => {
    const entries = [users()[0]];
    const result = view(
      state({ lastQueryError: { view: 'USERS', error: new Error('boom') } }),
      { type: 'SET_VIEW_USERS', entries } as any,
    );
    expect(result.users).toBe(entries);
    expect(result.lastQueryError).toBeNull();
  });

  test('records the selected row without disturbing other tables on SELECT_ROW', () => {
    const result = view(
      state({ selected: { user: 1, quest: null, feedback: null } }),
      { type: 'SELECT_ROW', table: 'quest', row: 0 } as any,
    );
    expect(result.selected).toEqual({ user: 1, quest: 0, feedback: null });
  });

  test('deselects a row when SELECT_ROW carries null', () => {
    const result = view(
      state({ selected: { user: 1, quest: 0, feedback: null } }),
      { type: 'SELECT_ROW', table: 'user', row: null } as any,
    );
    expect(result.selected).toEqual({ user: null, quest: 0, feedback: null });
  });

  test('updates loot points of the matching user on UPDATE_USER', () => {
    const result = view(state(), {
      type: 'UPDATE_USER',
      m: { userid: 'u2', loot_points: 12 },
    } as any);
    expect(result.users[1].loot_points).toEqual(12);
    expect(result.users[0].loot_points).toEqual(5);
  });

  test('treats an undefined loot_points as zero on UPDATE_USER', () => {
    const result = view(state(), {
      type: 'UPDATE_USER',
      m: { userid: 'u1' },
    } as any);
    expect(result.users[0].loot_points).toEqual(0);
  });

  test('leaves users untouched when no id matches on UPDATE_USER', () => {
    const result = view(state(), {
      type: 'UPDATE_USER',
      m: { userid: 'nobody', loot_points: 99 },
    } as any);
    expect(result.users).toEqual(users());
  });

  test('does not mutate the given state on UPDATE_USER', () => {
    const before = state();
    view(before, {
      type: 'UPDATE_USER',
      m: { userid: 'u1', loot_points: 42 },
    } as any);
    expect(before.users).toEqual(users());
  });

  test('publishes only the quest whose id and partition both match on UPDATE_QUEST', () => {
    const result = view(state(), {
      type: 'UPDATE_QUEST',
      m: { questid: 'q1', partition: 'expedition-private', published: false },
    } as any);
    expect(result.quests[0].published).toEqual(true);
    expect(result.quests[1].published).toEqual(false);
  });

  test('ignores UPDATE_QUEST when the id matches but the partition does not', () => {
    const result = view(state(), {
      type: 'UPDATE_QUEST',
      m: {
        questid: 'q1',
        partition: 'expedition-translated',
        published: false,
      },
    } as any);
    expect(result.quests).toEqual(quests());
  });

  test('ignores UPDATE_QUEST when the partition matches but the id does not', () => {
    const result = view(state(), {
      type: 'UPDATE_QUEST',
      m: { questid: 'q9', partition: 'expedition-public', published: false },
    } as any);
    expect(result.quests).toEqual(quests());
  });

  test('treats an undefined published as false on UPDATE_QUEST', () => {
    const result = view(state(), {
      type: 'UPDATE_QUEST',
      m: { questid: 'q1', partition: 'expedition-public' },
    } as any);
    expect(result.quests[0].published).toEqual(false);
  });

  test('does not mutate the given state on UPDATE_QUEST', () => {
    const before = state();
    view(before, {
      type: 'UPDATE_QUEST',
      m: { questid: 'q1', partition: 'expedition-public', published: false },
    } as any);
    expect(before.quests).toEqual(quests());
  });

  test('suppresses only the feedback matching user, quest and partition on UPDATE_FEEDBACK', () => {
    const result = view(state(), {
      type: 'UPDATE_FEEDBACK',
      m: {
        userid: 'u1',
        questid: 'q2',
        partition: 'expedition-public',
        suppress: true,
      },
    } as any);
    expect(result.feedback[0].suppressed).toEqual(false);
    expect(result.feedback[1].suppressed).toEqual(true);
  });

  test('ignores UPDATE_FEEDBACK when the partition does not match', () => {
    const result = view(state(), {
      type: 'UPDATE_FEEDBACK',
      m: {
        userid: 'u1',
        questid: 'q1',
        partition: 'expedition-private',
        suppress: true,
      },
    } as any);
    expect(result.feedback).toEqual(feedback());
  });

  test('treats an undefined suppress as false on UPDATE_FEEDBACK', () => {
    const before = state();
    before.feedback[0].suppressed = true;
    const result = view(before, {
      type: 'UPDATE_FEEDBACK',
      m: { userid: 'u1', questid: 'q1', partition: 'expedition-public' },
    } as any);
    expect(result.feedback[0].suppressed).toEqual(false);
  });

  test('records the failing view and error on QUERY_ERROR', () => {
    const error = new Error('query failed');
    const result = view(state(), {
      type: 'QUERY_ERROR',
      view: 'USERS',
      error,
    } as any);
    expect(result.lastQueryError).toEqual({ view: 'USERS', error });
  });

  test('returns the same state object for unhandled actions', () => {
    const before = state();
    expect(view(before, { type: 'NOT_A_VIEW_ACTION' } as any)).toBe(before);
  });
});
