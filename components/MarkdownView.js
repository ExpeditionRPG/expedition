import React from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/markdown';
import 'brace/theme/twilight';

// See https://github.com/securingsincity/react-ace
export default class MarkdownView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {data: ""};
  }

  componentDidMount() {
    $.get(this.props.url, function(result) {
      this.setState({data: result});
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
        mode="markdown"
        theme="twilight"
        fontSize="20px"
        onChange={this.onChange}
        width="100%"
        height="100%"
        value={this.state.data}
        name="markdown-editor"
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}