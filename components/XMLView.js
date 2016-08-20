import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/xml';
import 'brace/theme/twilight';

// See https://github.com/securingsincity/react-ace
// And https://ace.c9.io/#nav=howto
export default class XMLView extends React.Component {

  onChange(newValue) {
    console.log('change', newValue);
  }

  render() {
    return (
      <AceEditor
        mode="xml"
        theme="twilight"
        fontSize="20px"
        onChange={this.onChange}
        width="100%"
        height="100%"
        name="xml-editor"
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}