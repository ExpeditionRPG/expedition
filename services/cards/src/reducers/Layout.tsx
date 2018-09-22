import Redux from 'redux';
import {LayoutState} from './StateTypes';

export const initialState: LayoutState = {
  printing: false,
};

export default function Layout(state: LayoutState = initialState, action: Redux.Action): LayoutState {
  switch (action.type) {
    case 'LAYOUT_PRINTING':
      return {...state, printing: (action as any).printing};
    default:
      return state;
  }
}
