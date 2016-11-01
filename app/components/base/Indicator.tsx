import * as React from 'react';
import theme from '../../theme';

interface IndicatorProps extends React.Props<any> {
  icon?: string;
}

export default class Indicator extends React.Component<IndicatorProps, {}> {
  render() {
    var icon: JSX.Element = <span></span>;
    console.log(this.props);
    if (this.props.icon) {
      // Wrap in a "p" tag to have same padding as inner text
      icon = <p><img src={"images/" + this.props.icon + "_small.svg"}></img></p>;
    }

    return (
      <div className="base_indicator">
        {icon}
        <div className="text">{this.props.children}</div>
      </div>
    );
  }
}
