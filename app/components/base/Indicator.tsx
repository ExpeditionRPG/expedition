import * as React from 'react';
import theme from '../../theme';

interface IndicatorProps extends React.Props<any> {
  icon?: string;
}

export default class Indicator extends React.Component<IndicatorProps, {}> {
  style: any;

  constructor(props: any) {
    super(props);
    this.style = {
      container: {
        display: 'flex',
        flexDirection: 'row',
      },
      icon: {
        width: theme.vw.large,
        height: theme.vw.large,
        display: 'inline-block',
      },
      indicatorText: {
        fontStyle: 'italic',
        paddingLeft: theme.vw.base,
        paddingRight: theme.vw.large,
      }
    };
  }

  render() {
    var icon: JSX.Element = <span></span>;
    console.log(this.props);
    if (this.props.icon) {
      // Wrap in a "p" tag to have same padding as inner text
      icon = <p><img style={this.style.icon} src={"images/" + this.props.icon + "_small.svg"}></img></p>;
    }

    return (
      <div style={this.style.container}>
        {icon}
        <div style={this.style.indicatorText}>{this.props.children}</div>
      </div>
    );
  }
}
