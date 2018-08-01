import {connect} from 'react-redux';
import {AppState} from '../reducers/StateTypes';
import Main, {StateProps} from './Main';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    loading: state.cards.loading,
  };
};

const MainContainer = connect(
  mapStateToProps
)(Main);

export default MainContainer;
