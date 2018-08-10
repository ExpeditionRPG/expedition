import * as classNames from 'classnames';
import * as React from 'react';
import {Transition} from 'react-transition-group';

interface Props {
  classes: any;
  rippleSize: number;
  rippleX: number;
  rippleY: number;
}

interface State {
  leaving: boolean;
  visible: boolean;
}

export default class Ripple extends React.Component<Props, State> {
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
