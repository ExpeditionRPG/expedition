import Redux from 'redux'
import {connect} from 'react-redux'
import AppBar, {AppBarStateProps, AppBarDispatchProps} from './AppBar'
import {downloadCards} from '../actions/Cards'
import {filterChange} from '../actions/Filters'
import {AppState} from '../reducers/StateTypes'

const mapStateToProps = (state: AppState, ownProps: any): AppBarStateProps => {
  return {
    filters: state.filters,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AppBarDispatchProps => {
  return {
    downloadCards: () => {
      dispatch(downloadCards());
    },
    handleFilterChange(name: string, value: string | number): void {
      dispatch(filterChange(name, value));
    },
    openHelp: () => {
      window.open('https://github.com/ExpeditionRPG/expedition/blob/master/services/cards/CARD-CREATION.md');
    },
  };
}

const AppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBar);

export default AppBarContainer;
