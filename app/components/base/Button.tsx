import * as React from 'react'
import Button from '@material-ui/core/Button'
import MultiplayerRipple from '../multiplayer/MultiplayerRipple'
import {openWindow} from '../../Globals'

interface ButtonProps extends React.Props<any> {
  className?: string;
  disabled?: boolean;
  id?: string;
  remoteID?: string;
  onClick?: (e:any) => any;
}

export default class ExpeditionButton extends React.Component<ButtonProps, {}> {
  _onClick(e:any) {
    let target = e.target;
    while (target && target.nodeName.toLowerCase() !== 'expedition-button') {
      target = target.parentNode;
    }

    if (target && target.getAttribute('href')) {
      openWindow(target.getAttribute('href'));
      e.stopPropagation();
    }
    else {
      this.props.onClick && this.props.onClick(e);
    }

    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const className = 'base_button ' + (this.props.className || '');

    if (!this.props.remoteID) {
      return (
        <div id={this.props.id} className={className}>
        <Button disabled={this.props.disabled} onClick={(e:any) => this._onClick(e)}>
          <div>{this.props.children}</div>
        </Button>
        </div>
      )
    }

    return (
      <MultiplayerRipple remoteID={this.props.remoteID} className={className} id={this.props.id}>
        <Button disabled={this.props.disabled} onClick={(e:any) => this._onClick(e)}>
          <div>{this.props.children}</div>
        </Button>
      </MultiplayerRipple>
    );
  }
}
