import {connect} from 'react-redux';
import Redux from 'redux';

import {setDialog} from '../../actions/Dialogs';
import {AppState} from '../../reducers/StateTypes';
import FeedbackView, {FeedbackViewDispatchProps, FeedbackViewStateProps} from './FeedbackView';

const mapStateToProps = (state: AppState, ownProps: any): FeedbackViewStateProps => {
  return {
    list: state.view.feedback,
    selected: state.view.selected.feedback,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): FeedbackViewDispatchProps => {
  return {
    onRowSelect: (row: number) => {
      dispatch({type: 'SELECT_ROW', table: 'feedback', row});
      dispatch(setDialog('FEEDBACK_DETAILS'));
    },
  };
};

const FeedbackViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedbackView);

export default FeedbackViewContainer;
