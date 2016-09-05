import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/xml';
import 'brace/mode/markdown';
import 'brace/theme/twilight';

// See https://github.com/securingsincity/react-ace
export default class TextView extends React.Component {
  getValue() {
    if (this.ace) {
      return this.ace.editor.getValue();
    }
    return "";
  }

  setValue(value) {
    if (this.ace) {
      this.ace.editor.setValue(value);
    }
  }

  onRef(ref) {
    this.ace = ref;

    // Keep the editor focused when it's shown.
    if (this.ace) {
      ref.editor.focus();
    }
  }

  render() {
    return (
      <AceEditor
        ref={this.onRef.bind(this)}
        mode={this.props.mode}
        theme="twilight"
        fontSize={20}
        onChange={this.props.onChange}
        width="100%"
        height="100%"
        name={this.props.mode + "-editor"}
        value={this.props.value}
        setOptions={{wrapBehavioursEnabled: true, wrap: true}}
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}