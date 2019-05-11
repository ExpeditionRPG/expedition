import TouchRipple from '@material-ui/core/ButtonBase/TouchRipple';
import {playerOrder} from 'app/actions/Settings';
import {MultiplayerState} from 'app/reducers/StateTypes';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {InteractionEvent} from 'shared/multiplayer/Events';
import MultiplayerAffectorContainer from './MultiplayerAffectorContainer';

// MultiplayerRipple is copied with modifications from
// https://github.com/callemall/material-ui/blob/master/src/internal/TouchRipple.js
export interface Props {
  opacity?: number;
  children?: JSX.Element;
  multiplayer: MultiplayerState;
  id?: string;
  className?: string;
}

export interface State {
  hasRipple: boolean;
  nextKey: number;
  activePlayer: number;
}

export default class MultiplayerRipple extends React.Component<Props, State> {
  private ripple: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      // This prop allows us to only render the ReactTransitionGroup
      // on the first click of the component, making the inital render faster.
      hasRipple: false,
      nextKey: 0,
      activePlayer: 1,
    };
  }

  public handle(client: string, e: InteractionEvent) {
    // TODO keep start/end hashed by client, apply client color

    let activePlayer = 1;
    const order = playerOrder(this.props.multiplayer.session && this.props.multiplayer.session.secret || '');
    const clients = Object.keys(this.props.multiplayer.clientStatus).sort();
    for (let i = 0; i < clients.length; i++) {
      if (clients[i] === client) {
        activePlayer = order[i];
        break;
      }
    }
    if (this.props.id === null || e.event === 'touchmove' || e.id !== this.props.id) {
      return;
    }
    switch (e.event) {
      case 'touchstart':
        return this.start(
          (e.positions && e.positions[0] && e.positions[0][0]) || 500,
          (e.positions && e.positions[0] && e.positions[0][1]) || 500,
          activePlayer);
      case 'touchend':
        return this.end();
      default:
        return;
    }
  }

  public componentDidCatch(error: any, info: any) {
    console.error(error);
    console.info(info);
  }

  public start(posX: number, posY: number, activePlayer: number) {
    const el = ReactDOM.findDOMNode(this);
    const elHeight = (el as any).offsetHeight;
    const elWidth = (el as any).offsetWidth;
    const realX = elWidth * (posX / 1000);
    const realY = elHeight * (posY / 1000);
    const rect = (el && (el as any).getBoundingClientRect) ? (el as any).getBoundingClientRect() : {top: 0, left: 0};
    // Set the ripple
    if (!this.ripple) {
      return;
    }
    const event = {
      type: 'touchstart',
      clientX: rect.left + realX,
      clientY: rect.top + realY,
    };
    this.setState({activePlayer});
    this.ripple.start(event);
  }

  public end() {
    this.ripple.stop({type: 'touchend', persist: () => {/* empty function */}});
  }

  public onRippleRef(node: any) {
    this.ripple = node;
  }

  public render() {
    return (
      <MultiplayerAffectorContainer
        id={this.props.id}
        className={this.props.className}
        lazy={true}
        onInteraction={(c: string, i: InteractionEvent) => {this.handle(c, i); }}>
        <TouchRipple innerRef={(ref) => this.onRippleRef(ref)} children={null} component="span" classes={{child: `ripplep${this.state.activePlayer}`}} />
        {this.props.children}
      </MultiplayerAffectorContainer>
    );
  }
}
