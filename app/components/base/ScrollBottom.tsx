import * as React from 'react'

export class ScrollBottom extends React.Component<any, any> {
  onRef(ref: any) {
    if (!ref) {
      return;
    }
    ref.scrollTop = ref.scrollHeight;
  }

  render() {
    return (<div ref={this.onRef.bind(this)}>{this.props.children}</div>);
  }
}