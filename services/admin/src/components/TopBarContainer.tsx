import {connect} from 'react-redux';
import Redux from 'redux';

import {logoutUser} from '../actions/User';
import {queryView} from '../actions/View';
import {AppState, UserState, ViewType} from '../reducers/StateTypes';
import TopBar, {DispatchProps, StateProps} from './TopBar';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    user: state.user,
    view: state.view,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onFilterUpdate: (view: ViewType, filter: string) => {
      dispatch(queryView(view, filter));
    },
    onUserDialogRequest: (user: UserState) => {
      dispatch(logoutUser());
    },
  };
};

const TopBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBar);

export default TopBarContainer;
