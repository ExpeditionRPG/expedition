import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/xml';
import 'brace/theme/twilight';

// See https://github.com/securingsincity/react-ace
// And https://ace.c9.io/#nav=howto
export default class XMLView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {data: ""};
  }

  componentDidMount() {
    $.get(this.props.url, function(result) {
      this.setState({data: new XMLSerializer().serializeToString(result)});
    }.bind(this)).fail(function(err) {
      console.log(err);
    });
  }

  onChange(newValue) {
    console.log('change');
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
        value={this.state.data}
        name="xml-editor"
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}