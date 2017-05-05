import * as React from 'react'
import {OverrideTextArea} from './base/OverrideTextArea'

export interface NotesPanelStateProps {
  realtime: any;
}

export interface NotesPanelDispatchProps {
  onDirty: (realtime: any, text: string) => void;
}

interface NotesPanelProps extends NotesPanelStateProps, NotesPanelDispatchProps {}

interface RealtimeTextAreaProps extends React.Props<any> {
  realtime: any;
  onDirty: (realtime: any, text: string) => void;
}

declare var gapi: any;

class RealtimeTextArea extends React.Component<RealtimeTextAreaProps, {}> {
  silentChange: boolean;
  ref: any;

  getValue() {
    if (this.props.realtime) {
      return this.props.realtime.getText();
    }
    return '';
  }

  setValue(value: string) {
    if (this.props.realtime) {
      this.props.realtime.setValue(value);
    }
  }

  onRef(ref:any) {
    this.ref = ref;
    if (!this.ref) {
      return
    }

    if (this.props.realtime) {
      this.ref.value = this.props.realtime.getText();
    }
    // Register event listeners
    this.componentWillReceiveProps(this.props);
  }

  onTextInserted(event: any) {
    if (event.isLocal) {
      return;
    }
    this.silentChange = true;
    this.ref.value = this.ref.value.substr(0, event.index) + event.text + this.ref.value.substr(event.index);
    this.silentChange = false;
  }

  onTextDeleted(event: any) {
    if (event.isLocal) {
      return;
    }
    this.silentChange = true;
    this.ref.value = this.ref.value.substr(0, event.index) + this.ref.value.substr(event.index + event.text.length);
    this.silentChange = false;
  }

  componentWillReceiveProps(newProps: any) {
    // Ensure we're registered to the newest realtime value.
    if (this.props.realtime) {
      this.props.realtime.removeAllEventListeners();
    }
    newProps.realtime.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, (event: any) => { this.onTextInserted(event); });
    newProps.realtime.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, (event: any) => { this.onTextDeleted(event); });
  }

  onChange(e: any) {
    if (this.silentChange) {
      return;
    }
    this.props.onDirty(this.props.realtime, e.target.value);
    this.ref.value = this.props.realtime.getText();
  }

  render() {
    var text = 'Loading...';
    if (this.props.realtime) {
      text = this.props.realtime.getText();
    }

    return (
      <textarea
        ref={(ref: any) => this.onRef(ref)}
        onChange={(e: any) => this.onChange(e)}
        width="100%"
        height="100%"
      ></textarea>
    );
  }
}

// TODO(https://github.com/ExpeditionRPG/expedition-quest-creator/issues/255)
// Based on the left side, extract "key words" and allow the user to jump to note sections.
// Key words should also be linked/clickable in the ace editor.
// http://jsbin.com/jehopaja/4/edit?html,output
const NotesPanel = (props: NotesPanelProps): JSX.Element => {
  return (
    <div className="console">
      <div className="interactive">
        <RealtimeTextArea realtime={props.realtime} onDirty={props.onDirty}></RealtimeTextArea>
      </div>
    </div>
  );
};

export default NotesPanel;
