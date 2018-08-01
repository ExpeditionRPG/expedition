import Button from '@material-ui/core/Button';
import * as React from 'react';
import {openWindow} from '../../Globals';
import MultiplayerRipple from '../multiplayer/MultiplayerRipple';

interface Props extends React.Props<any> {
  className?: string;
  disabled?: boolean;
  id?: string;
  onClick?: (e: any) => any;
  remoteRipple?: boolean;
}

export default class ExpeditionButton extends React.Component<Props, {}> {
  public _onClick(e: any) {
    let target = e.target;
    while (target && target.nodeName.toLowerCase() !== 'expedition-button') {
      target = target.parentNode;
    }

    if (target && target.getAttribute('href')) {
      openWindow(target.getAttribute('href'));
      e.stopPropagation();
    } else if (this.props.onClick) {
      this.props.onClick(e);
    }

    e.preventDefault();
    e.stopPropagation();
  }

  public render() {
    const className = 'base_button ' + (this.props.className || '');

    if (this.props.remoteRipple === false || !this.props.id) {
      return (
        <div className={className}>
        <Button disabled={this.props.disabled} onClick={(e: any) => this._onClick(e)}>
          <div>{this.props.children}</div>
        </Button>
        </div>
      );
    }

    return (
      <MultiplayerRipple className={className} id={this.props.id}>
        <Button disabled={this.props.disabled} onClick={(e: any) => this._onClick(e)}>
          <div>{this.props.children}</div>
        </Button>
      </MultiplayerRipple>
    );
  }
}
