import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';

import theme from '../../theme';

interface ButtonProps extends React.Props<any> {
  dark?: boolean;
  disabled?: boolean;
  onTouchTap?: (e:any) => any;
}

export default class Button extends React.Component<ButtonProps, {}> {
  style(): any {
    return {
      display: 'block',
      height: 'auto',
      width: '100%',
      fontSize: theme.fontSize.interactive,
      padding: theme.vw.base,
      paddingTop: theme.vh.base,
      paddingBottom: theme.vh.base,
      margin: 0,
      marginTop: theme.vh.base,
      border: (this.props.disabled) ? theme.border.faded : theme.border.accent,
      backgroundColor: (this.props.dark) ? theme.colors.backgroundColorDarkInteractive : theme.colors.backgroundColorInteractive,
      textAlign: 'left',
      textTransform: 'none',
      textDecoration: 'none',
      color: (this.props.disabled) ? theme.colors.fontColorFaded : 'inherit',
      lineHeight: 1.2,
    }
  }

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
    return (
      <FlatButton disabled={this.props.disabled} onTouchTap={(e) => this._onTouchTap(e)} style={this.style()}>
        <div style={{display:"block"}}>{this.props.children}</div>
      </FlatButton>
    );
  }
}