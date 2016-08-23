import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/xml';
import 'brace/theme/twilight';

// See https://github.com/securingsincity/react-ace
export default class XMLView extends React.Component {
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
        mode="xml"
        theme="twilight"
        fontSize={20}
        onChange={this.props.onChange}
        width="100%"
        height="100%"
        value={this.props.data}
        name="xml-editor"
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}