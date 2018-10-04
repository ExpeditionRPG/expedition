import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../actions/Card';
import {search} from '../../actions/Search';
import {initialSearch} from '../../reducers/Search';
import {AppState, CardName, SettingsType} from '../../reducers/StateTypes';
import Navigation, {DispatchProps, Props, StateProps} from './Navigation';

const mapStateToProps = (state: AppState, ownProps: Partial<Props>): StateProps => {
  return {
    card: state.card,
    cardTheme: ownProps.cardTheme || 'light',
    questTheme: state.quest.details.theme || 'base',
    hasSearchResults: state.search.results.length > 0,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    toCard: (name: CardName, hasSearchResults: boolean, settings: SettingsType) => {
      if (name === 'SEARCH_CARD' && !hasSearchResults) {
        // Fire off a search if we don't have any search results already.
        dispatch(search({
          params: initialSearch.params,
          settings,
        }));
      }
      dispatch(toCard({name, noHistory: true}));
    },
  };
};

const NavigationContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);

export default NavigationContainer;
