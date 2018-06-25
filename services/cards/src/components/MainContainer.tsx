import {connect} from 'react-redux';
import Redux from 'redux';
import {AppState} from '../reducers/StateTypes';
import Main, {MainDispatchProps, MainStateProps} from './Main';

const mapStateToProps = (state: AppState, ownProps: any): MainStateProps => {
  return {
    loading: state.cards.loading,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MainDispatchProps => {
  return {};
};

const MainContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);

export default MainContainer;
