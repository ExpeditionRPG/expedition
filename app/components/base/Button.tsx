import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';

import theme from '../../theme';

interface ButtonProps extends React.Props<any> {
  className?: string;
  disabled?: boolean;
  onTouchTap?: (e:any) => any;
}

export default class Button extends React.Component<ButtonProps, {}> {
  _onTouchTap(e:any) {
    var target = e.target;
    while (target && target.nodeName.toLowerCase() !== 'expedition-button') {
      target = target.parentNode;
    }

    if (target && target.getAttribute('href')) {
      window.open(target.getAttribute('href'));
      e.stopPropagation();
    }
    else {
      this.props.onTouchTap(e);
    }
  }

  render() {
    const className = 'base_button ' + (this.props.className || '');
    return (
      <span className={className}>
        <FlatButton disabled={this.props.disabled} onTouchTap={(e:any) => this._onTouchTap(e)}>
          <div>{this.props.children}</div>
        </FlatButton>
      </span>
    );
  }
}
