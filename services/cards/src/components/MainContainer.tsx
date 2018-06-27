import {connect} from 'react-redux';
import {AppState} from '../reducers/StateTypes';
import Main, {MainStateProps} from './Main';

const mapStateToProps = (state: AppState, ownProps: any): MainStateProps => {
  return {
    loading: state.cards.loading,
  };
};

const MainContainer = connect(
  mapStateToProps
)(Main);

export default MainContainer;
