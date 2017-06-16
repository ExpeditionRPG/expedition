import Redux from 'redux'
import {connect} from 'react-redux'
import {AppState} from '../reducers/StateTypes'
import PlaytestPanel, {PlaytestPanelDispatchProps, PlaytestPanelStateProps} from './PlaytestPanel'
import {updateDirtyState} from '../actions/Editor'

const mapStateToProps = (state: AppState, ownProps: any): PlaytestPanelStateProps => {
  return {};
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): PlaytestPanelDispatchProps => {
  return {};
}

const PlaytestPanelContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaytestPanel);

export default PlaytestPanelContainer;
