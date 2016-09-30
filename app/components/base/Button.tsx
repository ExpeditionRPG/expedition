import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';

import theme from '../../theme';

interface ButtonProps extends React.Props<any> {
  onTouchTap?: (e:any) => any;
}

export default class Button extends React.Component<ButtonProps, {}> {
  style: any;

  constructor(props: any) {
    super(props);
    this.style = {
      button: {
        // Horizontal layout center
        display: 'block',
        height: 'auto',
        width: '100%',
        fontSize: theme.fontSize.interactive,
        padding: theme.vw.base,
        paddingTop: theme.vh.base,
        paddingBottom: theme.vh.base,
        margin: 0,
        marginTop: theme.vh.base,
        border: theme.border.accent,
        backgroundColor: theme.colors.backgroundColorInteractive,
        textAlign: 'left',
        textTransform: 'none',
        textDecoration: 'none',
        color: 'inherit',
      }
    };
  }

  /*

    paper-button.keyboard-focus {
      font-weight: inherit;
    };

    :host.disabled paper-button {
      color: var(--font-color-faded);
      border: var(--border-size) solid var(--font-color-faded);
    };

    .pad {
      padding-left: var(--vw-base);
      @apply(--layout-flex-3);
      @apply(--layout-vertical);
    }

    :host #subtext ::content h1 {
      margin: 0;
      margin-bottom: var(--vh-small);
      font-size: var(--font-size-interactive);
    }

    :host ::content div {
      font-size: var(--font-size-flavortext);
      margin-top: 2px;
      padding: 0 2vw;
    }
    };
  }
  */

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
      <FlatButton onTouchTap={(e) => this._onTouchTap(e)} style={this.style.button}>
        <div style={{display:"block"}}>{this.props.children}</div>
      </FlatButton>
    );
  }
}