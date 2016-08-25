import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/markdown';
import 'brace/theme/twilight';

// See https://github.com/securingsincity/react-ace
export default class MarkdownView extends React.Component {
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

  render() {
    return (
      <AceEditor
        ref={(ref) => this.ace = ref}
        mode="markdown"
        theme="twilight"
        fontSize={20}
        onChange={this.props.onChange}
        width="100%"
        height="100%"
        name="markdown-editor"
        value={this.getValue()}
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}