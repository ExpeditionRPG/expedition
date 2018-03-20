import Redux from 'redux'
import {connect} from 'react-redux'

import {AppState} from '../../reducers/StateTypes'
import UsersView, {UsersViewStateProps, UsersViewDispatchProps} from './UsersView'

const mapStateToProps = (state: AppState, ownProps: any): UsersViewStateProps => {
  return {
    list: state.view.users,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): UsersViewDispatchProps => {
  return {};
}

const UsersViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UsersView);

export default UsersViewContainer
