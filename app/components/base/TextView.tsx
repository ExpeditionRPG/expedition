import * as React from 'react'
import brace from 'brace'
import AceEditor from 'react-ace'

import 'brace/mode/xml'
import 'brace/mode/markdown'
import 'brace/theme/twilight'

interface TextViewProps extends React.Props<any> {
  onChange: any;
  value: string;
}


// See https://github.com/securingsincity/react-ace
export default class TextView extends React.Component<TextViewProps, {}> {
  ace: any;

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
    }
  }

  render() {
    return (
      <AceEditor
        ref={this.onRef.bind(this)}
        mode="markdown"
        theme="twilight"
        fontSize={20}
        onChange={this.props.onChange}
        width="100%"
        height="100%"
        name={"editor"}
        value={this.props.value}
        setOptions={{wrapBehavioursEnabled: true, wrap: true, tabSize: 2, useSoftTabs: true}}
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}