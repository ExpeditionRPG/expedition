import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/markdown';
import 'brace/theme/twilight';

// See https://github.com/securingsincity/react-ace
export default class MarkdownView extends React.Component {
  getValue() {
    if (this.ace.editor) {
      return this.ace.editor.getValue();
    }
    return null;
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
        value={this.props.data}
        name="markdown-editor"
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}