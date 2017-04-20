import * as React from 'react'
import {OverrideTextArea} from './base/OverrideTextArea'

export interface NotesPanelStateProps {
  realtime: any;
}

export interface NotesPanelDispatchProps {
  //onNotesBlur: (opInit: string) => void;
}

interface NotesPanelProps extends NotesPanelStateProps, NotesPanelDispatchProps {}


interface RealtimeTextAreaProps extends React.Props<any> {
  onChange?: any;
  realtime: any;
}

declare var gapi: any;

class RealtimeTextArea extends React.Component<RealtimeTextAreaProps, {}> {
  onSelectionChange: () => any;
  silentChange: boolean;
  silentSelectionChangeTimer: any;
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
    if (this.props.realtime) {
      this.props.realtime.setText(e.target.value);
    }

    if (this.props.onChange) {
      this.props.onChange(e.target.value);
    }
    this.ref.value = this.props.realtime.getText();
  }

  render() {
    console.log(this.props.realtime);
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



const NotesPanel = (props: NotesPanelProps): JSX.Element => {
  return (
    <div className="console">
      <div className="interactive">
        <RealtimeTextArea realtime={props.realtime}></RealtimeTextArea>
      </div>
      <div className="preview"></div>
    </div>
  );
};

export default NotesPanel;
