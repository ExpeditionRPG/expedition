import * as classNames from 'classnames';
import * as React from 'react';
import {Transition} from 'react-transition-group';

interface RippleProps {
  classes: any;
  rippleSize: number;
  rippleX: number;
  rippleY: number;
}

interface RippleState {
  leaving: boolean;
  visible: boolean;
}

export default class Ripple extends React.Component<RippleProps, RippleState> {
  public state = {
    leaving: false,
    visible: false,
  };

  public handleEnter = () => {
    this.setState({
      visible: true,
    });
  }

  public handleExit = () => {
    this.setState({
      leaving: true,
    });
  }

  public render() {
    console.log('Rendering ripple');
    const {
      classes,
      rippleSize,
      rippleX,
      rippleY,
      ...other,
    } = this.props;
    const { visible, leaving } = this.state;

    const rippleClassName = classNames(
      classes.ripple,
      {
        [classes.rippleVisible]: visible,
      }
    );

    const rippleStyles = {
      height: rippleSize,
      left: -(rippleSize / 2) + rippleX,
      top: -(rippleSize / 2) + rippleY,
      width: rippleSize,
    };
    console.log(rippleStyles);

    const childClassName = classNames(classes.child, {
      [classes.childLeaving]: leaving,
    });

    return (
      <Transition onEnter={() => this.handleEnter()} onExit={() => this.handleExit()} {...other} timeout={300}>
        <span className={rippleClassName} style={rippleStyles}>
          <span className={childClassName} />
        </span>
      </Transition>
    );
  }
}
