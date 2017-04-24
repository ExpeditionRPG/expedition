import Redux from 'redux'
import {connect} from 'react-redux'
import Main, {MainStateProps, MainDispatchProps} from './Main'

const mapStateToProps = (state: any, ownProps: any): MainStateProps => {
  return {
    loading: state.cards.loading,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MainDispatchProps => {
  return {};
}

const MainContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);

export default MainContainer;
