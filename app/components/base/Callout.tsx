import * as React from 'react';

interface CalloutProps extends React.Props<any> {
  icon?: string;
}

export default class Callout extends React.Component<CalloutProps, {}> {
  render() {
    let icon: JSX.Element = <span></span>;
    if (this.props.icon) {
      // Wrap in a "p" tag to have same padding as inner text
      icon = <p><img src={'images/' + this.props.icon + '_small.svg'}></img></p>;
    }

    return (
      <div className="callout">
        {icon}
        <div className="text">{this.props.children}</div>
      </div>
    );
  }
}
