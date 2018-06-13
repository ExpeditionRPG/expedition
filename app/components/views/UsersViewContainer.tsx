import Redux from 'redux'
import {connect} from 'react-redux'

import {AppState} from '../../reducers/StateTypes'
import UsersView, {UsersViewStateProps, UsersViewDispatchProps} from './UsersView'
import {setDialog} from '../../actions/Dialogs'

const mapStateToProps = (state: AppState, ownProps: any): UsersViewStateProps => {
  return {
    list: state.view.users,
    selected: state.view.selected.user,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): UsersViewDispatchProps => {
  return {
    onRowSelect: (row: number) => {
      dispatch({type: 'SELECT_ROW', table: 'user', row});
      dispatch(setDialog('USER_DETAILS'));
    },
  };
}

const UsersViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UsersView);

export default UsersViewContainer
