import Redux from 'redux'
import {connect} from 'react-redux'

import {toggleDrawer} from '../actions/Dialogs'
import {logoutUser} from '../actions/User'
import {AppState, UserState} from '../reducers/StateTypes'
import TopBar, {TopBarStateProps, TopBarDispatchProps} from './TopBar'

const mapStateToProps = (state: AppState, ownProps: any): TopBarStateProps => {
  return {
    user: state.user,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): TopBarDispatchProps => {
  return {
    onUserDialogRequest: (user: UserState) => {
      dispatch(logoutUser());
    },
    onMenuIconTap: () => {
      dispatch(toggleDrawer());
    }
  };
}

const TopBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBar);

export default TopBarContainer;
