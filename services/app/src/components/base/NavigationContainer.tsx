import {NAV_CARD_STORAGE_KEY} from 'app/Constants';
import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../actions/Card';
import {setStorageKeyValue} from '../../LocalStorage';
import {AppState, CardName} from '../../reducers/StateTypes';
import Navigation, {DispatchProps, Props, StateProps} from './Navigation';

const mapStateToProps = (state: AppState, ownProps: Partial<Props>): StateProps => {
  return {
    card: state.card,
    cardTheme: ownProps.cardTheme || 'light',
    hasSearchResults: (state.search.results || false) && state.search.results.length > 0,
    questTheme: state.quest.details.theme || 'base',
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    toCard: (name: CardName) => {
      dispatch(toCard({name, noHistory: true}));

      // Save nav state in local storage so we can persist the user's
      // last used page next time they load.
      setStorageKeyValue(NAV_CARD_STORAGE_KEY, name);
    },
  };
};

const NavigationContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);

export default NavigationContainer;
