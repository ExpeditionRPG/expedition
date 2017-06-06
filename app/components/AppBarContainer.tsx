import Redux from 'redux'
import {connect} from 'react-redux'
import AppBar, {AppBarStateProps, AppBarDispatchProps} from './AppBar'
import {DownloadCards} from '../actions/Cards'
import {FilterChange} from '../actions/Filters'
import {initialState} from '../reducers/Filters'
import {AppState} from '../reducers/StateTypes'

const mapStateToProps = (state: AppState, ownProps: any): AppBarStateProps => {
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
    openHelp: () => {
      window.open('https://github.com/Fabricate-IO/expedition-cards/blob/master/CARD-CREATION.md');
    },
  };
}

const AppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBar);

export default AppBarContainer;
