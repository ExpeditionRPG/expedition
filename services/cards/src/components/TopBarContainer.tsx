import {connect} from 'react-redux';
import Redux from 'redux';
import {downloadCards} from '../actions/Cards';
import {filterChange} from '../actions/Filters';
import {AppState} from '../reducers/StateTypes';
import TopBar, {TopBarDispatchProps, TopBarStateProps} from './TopBar';

const mapStateToProps = (state: AppState, ownProps: any): TopBarStateProps => {
  return {
    filters: state.filters,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): TopBarDispatchProps => {
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
};

const TopBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBar);

export default TopBarContainer;
