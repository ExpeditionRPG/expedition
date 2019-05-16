import * as React from 'react';

export interface StateProps {
  realtime: any;
  realtimeModel: any;
}

export interface DispatchProps {
  onDirty: (realtime: any, text: string) => void;
}

interface Props extends StateProps, DispatchProps {}

class RealtimeTextArea extends React.Component<Props, {}> {
  public silentChange: boolean;
  public ref: any;

  public getValue() {
    if (this.props.realtime) {
      return this.props.realtime.getText();
    }
    return '';
  }

  public setValue(value: string) {
    if (this.props.realtime) {
      // Don't allow async undo... for now. We instead rely on ace's UndoManager.
      // TODO: Figure out UX when undoing notes from the main editor, and vice versa.
      // https://developers.google.com/google-apps/realtime/conflict-resolution#preventing_undo
      this.props.realtimeModel.beginCompoundOperation('', false);
      this.props.realtime.setValue(value);
      this.props.realtimeModel.endCompoundOperation();
    }
  }

  public onRef(ref: any) {
    this.ref = ref;
    if (!this.ref) {
      return;
    }

    if (this.props.realtime) {
      this.ref.value = this.props.realtime.getText();
    }
    // Register event listeners
    this.componentWillReceiveProps(this.props);
  }

  public onTextInserted(event: any) {
    if (event.isLocal) {
      return;
    }
    this.silentChange = true;
    this.ref.value = this.ref.value.substr(0, event.index) + event.text + this.ref.value.substr(event.index);
    this.silentChange = false;
  }

  public onTextDeleted(event: any) {
    if (event.isLocal) {
      return;
    }
    this.silentChange = true;
    this.ref.value = this.ref.value.substr(0, event.index) + this.ref.value.substr(event.index + event.text.length);
    this.silentChange = false;
  }

  public componentWillReceiveProps(newProps: any) {
    // Ensure we're registered to the newest realtime value.
    if (this.props.realtime) {
      this.props.realtime.removeAllEventListeners();
    }
  }

  public onChange(e: any) {
    if (this.silentChange) {
      return;
    }
    this.props.onDirty(this.props.realtime, e.target.value);
    this.ref.value = this.props.realtime.getText();
  }

  public render() {
    return (
      <textarea
        id="notesArea"
        ref={(ref: any) => this.onRef(ref)}
        onChange={(e: any) => this.onChange(e)} />
    );
  }
}

// TODO(https://github.com/ExpeditionRPG/expedition-quest-creator/issues/255)
// Based on the left side, extract "key words" and allow the user to jump to note sections.
// Key words should also be linked/clickable in the ace editor.
// http://jsbin.com/jehopaja/4/edit?html,output
const NotesPanel = (props: Props): JSX.Element => {
  return (
    <div className="console">
      <div className="interactive">
        <RealtimeTextArea
          realtime={props.realtime}
          realtimeModel={props.realtimeModel}
          onDirty={props.onDirty} />
      </div>
    </div>
  );
};

export default NotesPanel;
