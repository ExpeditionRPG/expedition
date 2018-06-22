import Redux from 'redux'
import {connect} from 'react-redux'

import {AppState} from '../../reducers/StateTypes'
import FeedbackView, {FeedbackViewStateProps, FeedbackViewDispatchProps} from './FeedbackView'
import {FeedbackEntry} from '@expedition-api/admin/QueryTypes'
import {setDialog} from '../../actions/Dialogs'

const mapStateToProps = (state: AppState, ownProps: any): FeedbackViewStateProps => {
  return {
    list: state.view.feedback,
    selected: state.view.selected.feedback,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): FeedbackViewDispatchProps => {
  return {
    onRowSelect: (row: number) => {
      dispatch({type: 'SELECT_ROW', table: 'feedback', row});
      dispatch(setDialog('FEEDBACK_DETAILS'));
    },
  };
}

const FeedbackViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedbackView);

export default FeedbackViewContainer
