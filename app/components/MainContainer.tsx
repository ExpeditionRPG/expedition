import {connect} from 'react-redux'
import {setDirty} from '../actions/editor'
import {AppState} from '../reducers/StateTypes'
import Main, {MainStateProps, MainDispatchProps} from './Main'

var toMarkdown: any = require('../../translation/to_markdown')

const mapStateToProps = (state: AppState, ownProps: any): MainStateProps => {
  return {
    loggedIn: state.user.loggedIn,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MainDispatchProps => {
  return {
  	onDragFinished: (size: number) => {
  		console.log("herp");
  	}
  };
}

const MainContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);

export default MainContainer