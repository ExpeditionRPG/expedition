import * as React from 'react'
import brace from 'brace'
import AceEditor from 'react-ace'

import 'brace/mode/xml'
import 'brace/mode/markdown'
import 'brace/theme/twilight'

var acequire: any = (require('brace') as any).acequire;
const { Range } = acequire('ace/range');

import { QDLMode } from './QDLMode'
var mode = new QDLMode();

interface TextViewProps extends React.Props<any> {
  onChange: any;
  realtime: any;
}

declare var gapi: any;

// See https://github.com/securingsincity/react-ace
export default class TextView extends React.Component<TextViewProps, {}> {
  ace: any;
  silentChange: boolean;

  getValue() {
    if (this.ace) {
      return this.ace.editor.getValue();
    }
    return "";
  }

  setValue(value: string) {
    if (this.ace) {
      this.ace.editor.setValue(value);
    }
  }

  onRef(ref: any) {
    this.ace = ref;

    // Keep the editor focused when it's shown.
    if (this.ace) {
      ref.editor.focus();

      // "Automatically scrolling cursor into view after selection change
      // this will be disabled in the next version set
      // editor.$blockScrolling = Infinity to disable this message"
      ref.editor.$blockScrolling = Infinity;

      // Set our custom mode.
      ref.editor.getSession().$mode = mode;
      ref.editor.getSession().bgTokenizer.setTokenizer(mode.getTokenizer());

      // Additional configuration
      ref.editor.setOption('tabSize', 2);
      ref.editor.setOption('wrapBehavioursEnabled', true);
      ref.editor.setOption('wrap', true);
      ref.editor.setOption('useSoftTabs', true);
    }
  }

  onTextInserted(event: any) {
    if (event.isLocal) {
      return;
    }
    var doc = this.ace.editor.session.getDocument();
    this.silentChange = true;
    doc.insert(doc.indexToPosition(event.index, 0), event.text);
    this.silentChange = false;
  }

  onTextDeleted(event: any) {
    if (event.isLocal) {
      return;
    }
    var doc = this.ace.editor.session.getDocument();
    this.silentChange = true;
    var start = doc.indexToPosition(event.index, 0);
    var end = doc.indexToPosition(event.index + event.text.length, 0);
    doc.remove(new Range(start.row, start.column, end.row, end.column));
    this.silentChange = false;
  }

  componentWillReceiveProps(newProps: any) {
    // Ensure we're registered to the newest realtime value.
    if (this.props.realtime) {
      this.props.realtime.removeAllEventListeners();
    }
    newProps.realtime.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, this.onTextInserted.bind(this));
    newProps.realtime.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, this.onTextDeleted.bind(this));
  }

  onChange(text: string) {
    if (this.silentChange) {
      return;
    }

    if (this.props.realtime) {
      this.props.realtime.setText(text);
    }

    if (this.props.onChange) {
      this.props.onChange(text);
    }
  }

  render() {
    var text = "Loading...";
    if (this.props.realtime) {
      text = this.props.realtime.getText()
    }

    return (
      <AceEditor
        ref={this.onRef.bind(this)}
        mode="markdown"
        theme="twilight"
        fontSize={20}
        onChange={(text: string) => this.onChange(text)}
        width="100%"
        height="100%"
        name={"editor"}
        value={text}
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}