import Redux from 'redux'
import {connect} from 'react-redux'

import {AppState} from '../../reducers/StateTypes'
import QuestsView, {QuestsViewStateProps, QuestsViewDispatchProps} from './QuestsView'
import {setDialog} from '../../actions/Dialogs'

const mapStateToProps = (state: AppState, ownProps: any): QuestsViewStateProps => {
  return {
    list: state.view.quests,
    selected: state.view.selected.quest,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestsViewDispatchProps => {
  return {
    onRowSelect: (row: number) => {
      dispatch({type: 'SELECT_ROW', table: 'quest', row});
      dispatch(setDialog('QUEST_DETAILS'));
    },
  };
}

const QuestsViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestsView);

export default QuestsViewContainer
