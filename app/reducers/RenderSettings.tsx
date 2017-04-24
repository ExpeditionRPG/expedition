export const initialState: any = {
  cardsPerPage: 9,
  theme: 'BlackAndWhite',
}

export default function RenderSettings(state: any = initialState, action: any) {
  let newState: any;
  switch (action.type) {
    case 'FILTERS_UPDATED':
    // TODO fill in rest of filter settings
      newState = Object.assign({}, state);
      newState.theme = action.filters.theme.current;
      switch (action.filters.export) {
        case 'PrintAndPlay':
          newState.cardsPerPage = 9;
          break;
        case 'WebView':
          newState.cardsPerPage = 1;
          break;
      }
      return newState;
    default:
      return state;
  }
}
