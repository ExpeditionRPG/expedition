export const initialState: any = {
  cardsPerPage: 9,
  showFronts: true,
  showBacks: true,
  theme: 'BlackAndWhite',
  uniqueBacksOnly: false,
}

export default function RenderSettings(state: any = initialState, action: any) {
  let newState: any;
  switch (action.type) {
    case 'CARDS_FILTER':
      // NOTE: resets to initialState each time, so that each export setting doesn't have to
      newState = Object.assign({}, initialState);
      newState.theme = action.filters.theme.current;
      switch (action.filters.export.current) {
        case 'PrintAndPlay':
          break;
        case 'WebView':
          newState.cardsPerPage = 999; // TODO this requires some CSS / class changes...
          newState.showBacks = false;
          break;
        case 'DriveThruCards':
          break;
        case 'AdMagicFronts':
          newState.cardsPerPage = 1;
          newState.showBacks = false;
          break;
        case 'AdMagicBacks':
          newState.cardsPerPage = 1;
          newState.showFronts = false;
          newState.uniqueBacksOnly = true;
          break;
        case 'FrontsOnly':
          newState.showBacks = false;
          break;
      }
      return newState;
    default:
      return state;
  }
}
