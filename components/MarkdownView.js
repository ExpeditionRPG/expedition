import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/markdown';
import 'brace/theme/twilight';

// See https://github.com/securingsincity/react-ace
export default class MarkdownView extends React.Component {

  onChange(newValue) {
    console.log('change', newValue);
  }

  render() {
    return (
      <AceEditor
        mode="markdown"
        theme="twilight"
        fontSize="20px"
        onChange={this.onChange}
        width="100%"
        height="100%"
        name="markdown-editor"
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}