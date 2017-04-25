import Redux from 'redux'
import {connect} from 'react-redux'
import AppBar, {AppBarStateProps, AppBarDispatchProps} from './AppBar'
import {DownloadCards} from '../actions/Cards'
import {FilterChange} from '../actions/Filters'
import {initialState} from '../reducers/Filters'

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

const AppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBar);

export default AppBarContainer;
