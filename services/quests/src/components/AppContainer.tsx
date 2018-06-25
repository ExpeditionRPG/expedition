import {connect} from 'react-redux';
import Redux from 'redux';
import {AppState} from '../reducers/StateTypes';
import App, {AppDispatchProps, AppStateProps} from './App';

const mapStateToProps = (state: AppState, ownProps: any): AppStateProps => {
  return {};
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AppDispatchProps => {
  return {};
};

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;
