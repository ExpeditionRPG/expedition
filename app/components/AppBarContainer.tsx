import Redux from 'redux'
import {connect} from 'react-redux'
import AppBar, {AppBarStateProps, AppBarDispatchProps} from './AppBar'
import {DownloadCards} from '../actions/Cards'
import {FilterChange} from '../actions/Filters'
import {initialState} from '../reducers/Filters'

declare var require: any;
const qs = require('qs') as any;

const mapStateToProps = (state: any, ownProps: any): AppBarStateProps => {
  return {
    filters: state.filters,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AppBarDispatchProps => {
  return {
    downloadCards: () => {
      dispatch(DownloadCards());
    },
    handleFilterChange(name: string, value: string | number): void {
      // Update URL - don't include in URL if it's the default value
      let query = Object.assign(qs.parse(window.location.search.substring(1)), {[name]: value});
      Object.keys(query).forEach((key) => {
        if (query[key] === initialState[key].default) {
          delete query[key];
        }
      });
      window.history.pushState(null, 'Expedition Card Creator', '?' + qs.stringify(query));
      dispatch(FilterChange(name, value));
    },
  };
}

const AppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBar);

export default AppBarContainer;
