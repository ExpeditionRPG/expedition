// deepmerge ships two builds: a CommonJS `main` (dist/umd.js, which does
// `module.exports = fn`) and an ESM `module` (dist/es.js, a default export and
// nothing else). Webpack's default `mainFields` for the web target prefers
// `module`, while Jest and Node resolve `main`. esModuleInterop is off (see
// tsconfig.json), so tsc/swc emit a bare `require()` for every import form:
// under webpack that yields the namespace object `{default: fn}` (not
// callable), under Jest/Node it yields the function itself. Neither a default
// import nor a namespace import is therefore correct in both environments --
// unwrap the interop explicitly instead. Covered by UserQuests.test.tsx.
import * as deepmergeModule from 'deepmerge';
import Redux from 'redux';
import {
  UserQuestsAction,
  UserQuestsDeltaAction,
} from '../actions/ActionTypes';
import { UserQuestsState } from './StateTypes';

const merge: typeof deepmergeModule =
  (deepmergeModule as any).default || deepmergeModule;

const initialUserQuests: UserQuestsState = {
  history: {},
};

export function userquests(
  state: UserQuestsState = initialUserQuests,
  action: Redux.Action,
): UserQuestsState {
  switch (action.type) {
    case 'USER_QUESTS':
      const a = action as UserQuestsAction;
      return { ...state, history: a.quests };
    case 'USER_QUESTS_DELTA':
      const delta = (action as UserQuestsDeltaAction).delta;
      return merge(state, { history: delta }) as UserQuestsState;
    default:
      return state;
  }
}
