import * as React from 'react';

export class ScrollBottom extends React.Component<any, any> {
  public onRef(ref: any) {
    if (!ref) {
      return;
    }
    ref.scrollTop = ref.scrollHeight;
  }

  public render() {
    return (<div className="scrollBottom" ref={this.onRef.bind(this)}>{this.props.children}</div>);
  }
}
