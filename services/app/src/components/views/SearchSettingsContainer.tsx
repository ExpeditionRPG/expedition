import {connect} from 'react-redux';
import Redux from 'redux';
import {search} from '../../actions/Search';
import {AppStateWithHistory, SearchParams, SettingsType} from '../../reducers/StateTypes';
import SearchSettings, {DispatchProps, StateProps} from './SearchSettings';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return {
    params: state.search.params,
    settings: state.settings,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onSearch: (params: SearchParams, settings: SettingsType) => {
      dispatch(search({params, settings}));
    },
  };
};

const SearchSettingsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchSettings);

export default SearchSettingsContainer;
