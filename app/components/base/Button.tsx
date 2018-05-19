import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import MultiplayerRipple from '../multiplayer/MultiplayerRipple'
import {openWindow} from '../../Globals'

interface ButtonProps extends React.Props<any> {
  className?: string;
  disabled?: boolean;
  id?: string;
  remoteID?: string;
  onTouchTap?: (e:any) => any;
}

export default class Button extends React.Component<ButtonProps, {}> {
  _onTouchTap(e:any) {
    let target = e.target;
    while (target && target.nodeName.toLowerCase() !== 'expedition-button') {
      target = target.parentNode;
    }

    if (target && target.getAttribute('href')) {
      openWindow(target.getAttribute('href'));
      e.stopPropagation();
    }
    else {
      this.props.onTouchTap && this.props.onTouchTap(e);
    }

    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const className = 'base_button ' + (this.props.className || '');

    if (!this.props.remoteID) {
      return (
        <div id={this.props.id} className={className}>
        <FlatButton disabled={this.props.disabled} onTouchTap={(e:any) => this._onTouchTap(e)}>
          <div>{this.props.children}</div>
        </FlatButton>
        </div>
      )
    }

    return (
      <MultiplayerRipple remoteID={this.props.remoteID} className={className} id={this.props.id}>
        <FlatButton disabled={this.props.disabled} onTouchTap={(e:any) => this._onTouchTap(e)}>
          <div>{this.props.children}</div>
        </FlatButton>
      </MultiplayerRipple>
    );
  }
}
