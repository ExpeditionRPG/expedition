import Redux from 'redux';
import {TutorialState} from './StateTypes';

const tutorialState: TutorialState = {
  playFromCursor: true,
};

export function tutorial(state: TutorialState = tutorialState, action: Redux.Action): TutorialState {
  switch (action.type) {
    case 'REBOOT_APP':
      return {...state, playFromCursor: false};
    default:
      return state;
  }
}
