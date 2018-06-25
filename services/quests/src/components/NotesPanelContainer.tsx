import Redux from 'redux'
import {connect} from 'react-redux'
import {AppState} from '../reducers/StateTypes'
import NotesPanel, {NotesPanelDispatchProps, NotesPanelStateProps} from './NotesPanel'
import {updateDirtyState} from '../actions/Editor'

const mapStateToProps = (state: AppState, ownProps: any): NotesPanelStateProps => {
  return {
    realtime: state.quest.notesRealtime,
    realtimeModel: state.quest.realtimeModel,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): NotesPanelDispatchProps => {
  return {
    onDirty: (realtime: any, text: string) => {
      realtime.setText(text);
      dispatch(updateDirtyState());
    },
  };
}

const NotesPanelContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotesPanel);

export default NotesPanelContainer;
