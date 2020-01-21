import * as React from 'react';
import {COLORBLIND_FRIENDLY_PALETTE} from '../../Constants';

export interface Props extends React.Props<any> {
  clientInputs: {[client: string]: {[id: string]: number[]}};
}

export default class TouchIndicator extends React.Component<Props, {}> {
  public ctx: any;
  public canvas: any;
  public styles: any;

  constructor(props: Props) {
    super(props);
    this.styles = {
      center: {
        radius: 36,
      },
      ring: {
        color: '#FFFFFF',
        radius: 44,
        width: 5,
      },
    };
  }

  public shouldComponentUpdate() {
    // Never re-render the canvas (except by force).
    // Instead, take this as a hint to draw the touch points.
    window.requestAnimationFrame(() => this.drawTouchPoints());
    return false;
  }

  public componentDidUpdate() {
    // Redraw touch points every time the component repaints.
    this.drawTouchPoints();
  }

  protected drawTouchPoint(x: number, y: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.styles.center.radius, 0, 2 * Math.PI, false);
    this.ctx.fill();
    this.ctx.strokeStyle = this.styles.ring.color;
    this.ctx.lineWidth = this.styles.ring.width;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.styles.ring.radius, 0, 2 * Math.PI, false);
    this.ctx.stroke();
  }

  private drawTouchPoints() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const keys = Object.keys(this.props.clientInputs);
    for (let i = 0; i < keys.length && i < COLORBLIND_FRIENDLY_PALETTE.length; i++) {
      const color = COLORBLIND_FRIENDLY_PALETTE[i];
      const inputs = this.props.clientInputs[keys[i]];
      for (const k of Object.keys(inputs)) {
        this.drawTouchPoint(inputs[k][0] * this.ctx.canvas.width / 1000, inputs[k][1] * this.ctx.canvas.height / 1000, color);
      }
    }
  }

  public setupCanvas(ref: Element|null) {
    // We have nothing to do if we're given the same canvas as previous.
    if (this.canvas === ref) {
      return;
    }

    // Setup canvas element
    this.canvas = ref;
    if (!this.canvas) {
      return;
    }

    window.requestAnimationFrame(() => {
      this.ctx = this.canvas.getContext('2d');
      if (!this.canvas.parentElement) {
        console.error('Could not find canvas parent element');
        return;
      }
      this.ctx.canvas.width = this.canvas.parentElement.offsetWidth;
      this.ctx.canvas.height = this.canvas.parentElement.offsetHeight;
    });
  }

  public render() {
    return (
      <canvas className="base_multi_touch_trigger touch_indicator" ref={(ref: Element|null) => {this.setupCanvas(ref); }} />
    );
  }
}
