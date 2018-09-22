import {connect} from 'react-redux';
import Redux from 'redux';
import {downloadCards} from '../actions/Cards';
import {filterChange} from '../actions/Filters';
import {AppState} from '../reducers/StateTypes';
import TopBar, {DispatchProps, StateProps} from './TopBar';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    filters: state.filters,
    printing: state.ui.printing,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
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
