import Redux from 'redux'
import {connect} from 'react-redux'

import {AppState} from '../../reducers/StateTypes'
import QuestsView, {QuestsViewStateProps, QuestsViewDispatchProps} from './QuestsView'

const mapStateToProps = (state: AppState, ownProps: any): QuestsViewStateProps => {
  return {};
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestsViewDispatchProps => {
  return {};
}

const QuestsViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestsView);

export default QuestsViewContainer
