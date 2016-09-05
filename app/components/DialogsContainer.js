import { connect } from 'react-redux'
import {setDialog, toggleDrawer} from './actions'
import Dialogs from './Dialogs'

const mapStateToProps = (state, ownProps) => {
  return {
    open: state.dialogs,
    user_name: (state.user) ? state.user.name : null,
    short_url: null
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onRequestClose: (dialog, choice) => {
      dispatch(setDialog(dialog, choice));
    }
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer