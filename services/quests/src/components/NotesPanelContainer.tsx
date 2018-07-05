import {connect} from 'react-redux';
import Redux from 'redux';
import {updateDirtyState} from '../actions/Editor';
import {AppState} from '../reducers/StateTypes';
import NotesPanel, {NotesPanelDispatchProps, NotesPanelStateProps} from './NotesPanel';

const mapStateToProps = (state: AppState, ownProps: any): NotesPanelStateProps => {
  return {
    realtime: state.quest.notesRealtime,
    realtimeModel: state.quest.realtimeModel,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): NotesPanelDispatchProps => {
  return {
    onDirty: (realtime: any, text: string) => {
      realtime.setText(text);
      dispatch(updateDirtyState());
    },
  };
};

const NotesPanelContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotesPanel);

export default NotesPanelContainer;
