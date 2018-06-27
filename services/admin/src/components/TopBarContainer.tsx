import Redux from 'redux'
import {connect} from 'react-redux'

import {logoutUser} from '../actions/User'
import {queryView} from '../actions/View'
import {AppState, UserState, ViewType} from '../reducers/StateTypes'
import TopBar, {TopBarStateProps, TopBarDispatchProps} from './TopBar'

const mapStateToProps = (state: AppState, ownProps: any): TopBarStateProps => {
  return {
    user: state.user,
    view: state.view,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): TopBarDispatchProps => {
  return {
    onUserDialogRequest: (user: UserState) => {
      dispatch(logoutUser());
    },
    onFilterUpdate: (view: ViewType, filter: string) => {
      dispatch(queryView(view, filter));
    },
  };
}

const TopBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBar);

export default TopBarContainer;
