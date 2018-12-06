import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../actions/Card';
import {changeSearchParams} from '../../actions/Search';
import {getContentSets} from '../../actions/Settings';
import {AppStateWithHistory, SearchParams} from '../../reducers/StateTypes';
import SearchSettings, {DispatchProps, StateProps} from './SearchSettings';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return {
    params: state.search.params,
    settings: state.settings,
    user: state.user,
    contentSets: getContentSets(state.settings, state.multiplayer),
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onSearch: (params: SearchParams) => {
      dispatch(changeSearchParams(params));
      dispatch(toCard({name: 'SEARCH_CARD'}));
    },
  };
};

const SearchSettingsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchSettings);

export default SearchSettingsContainer;
