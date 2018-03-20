import Redux from 'redux'
import {connect} from 'react-redux'

import {AppState} from '../../reducers/StateTypes'
import FeedbackView, {FeedbackViewStateProps, FeedbackViewDispatchProps} from './FeedbackView'

const mapStateToProps = (state: AppState, ownProps: any): FeedbackViewStateProps => {
  return {};
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): FeedbackViewDispatchProps => {
  return {};
}

const FeedbackViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedbackView);

export default FeedbackViewContainer
