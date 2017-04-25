import Redux from 'redux'
import {connect} from 'react-redux'
import AppBar, {AppBarStateProps, AppBarDispatchProps} from './AppBar'
import {DownloadCards} from '../actions/Cards'
import {FilterChange} from '../actions/Filters'

declare var require: any;
const reactUrlQuery = require('react-url-query') as any;

const urlPropsQueryConfig = {
  filters: { type: reactUrlQuery.UrlQueryParamTypes.object },
}

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
      dispatch(FilterChange(name, value));
    },
  };
}

const AppBarContainer = reactUrlQuery.addUrlProps({ urlPropsQueryConfig })(connect(mapStateToProps, mapDispatchToProps)(AppBar));

export default AppBarContainer;
