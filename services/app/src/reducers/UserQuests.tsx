// deepmerge 2 shipped a CommonJS `main` (dist/umd.js) *and* an ESM `module`
// (dist/es.js, default export only). Webpack's `mainFields` preferred `module`
// while Jest and Node took `main`, and with esModuleInterop off (see
// tsconfig.json) the same `require()` therefore yielded a non-callable
// `{default: fn}` under webpack and the bare function under Jest -- so the
// interop had to be unwrapped by hand. deepmerge 4 dropped the `module` field
// entirely: every consumer now resolves dist/cjs.js, which does
// `module.exports = fn`, so a plain namespace import is callable everywhere.
// Covered by UserQuests.test.tsx.
import * as merge from 'deepmerge';
import Redux from 'redux';
import {
  UserQuestsAction,
  UserQuestsDeltaAction,
} from '../actions/ActionTypes';
import { UserQuestsState } from './StateTypes';

const initialUserQuests: UserQuestsState = {
  history: {},
};

export function userquests(
  state: UserQuestsState = initialUserQuests,
  action: Redux.Action,
): UserQuestsState {
  switch (action.type) {
    case 'USER_QUESTS': {
      const a = action as UserQuestsAction;
      return { ...state, history: a.quests };
    }
    case 'USER_QUESTS_DELTA': {
      const delta = (action as UserQuestsDeltaAction).delta;
      return merge(state, { history: delta }) as UserQuestsState;
    }
    default:
      return state;
  }
}
