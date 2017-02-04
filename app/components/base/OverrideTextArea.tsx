import * as React from 'react'

// We need a managed textarea to allow post-init overwriting
// of textarea value.
export class OverrideTextArea extends React.Component<any, any> {
  state: {value: string};

  constructor(props: any) {
    super(props);
    this.state = {value: props.value || ""};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: any) {
    this.setState({value: event.target.value});
  }

  componentWillReceiveProps(nextProps: any) {
    this.setState({value: nextProps.value});
  }

  render() {
    return (
      <textarea value={this.state.value} onChange={this.handleChange} onBlur={this.props.onBlur} />
    );
  }
}
