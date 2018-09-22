import Redux from 'redux';
import {UiState} from './StateTypes';

export const initialState: UiState = {
  printing: false,
};

export default function Ui(state: UiState = initialState, action: Redux.Action): UiState {
  switch (action.type) {
    case 'UI_PRINTING':
      return {...state, printing: (action as any).printing};
    default:
      return state;
  }
}
