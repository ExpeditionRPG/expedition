import * as React from 'react'

export interface TouchPanelProps extends React.Props<any> {
  onTouchChange?: (touches: any) => any;
}

export default class TouchPanel extends React.Component<TouchPanelProps, {}> {
  ctx: any;
  canvas: any;
  inputArray: number[][];
  private boundDrawTouchPoints: () => void;
  styles: any;

  constructor(props: TouchPanelProps) {
    super(props);
    this.boundDrawTouchPoints = this.drawTouchPoints.bind(this);
    this.styles = {
      center: {
        radius: 36,
        color: '#1B1718',
      },
      ring: {
        radius: 44,
        width: 5,
        color: '#FFFFFF',
      },
    };
  }

  public processInput(xyArray: number[][]) {
    if (!Boolean(this.inputArray) || xyArray.length !== this.inputArray.length) {
      this.props.onTouchChange && this.props.onTouchChange(xyArray.length);
    }
    this.inputArray = xyArray;

    // Request a single animation frame every time our input values change,
    // instead of rendering continuously (saves render load).
    window.requestAnimationFrame(this.boundDrawTouchPoints);
  }

  protected drawTouchPoint(x: number, y: number) {
    this.ctx.fillStyle = this.styles.center.color;
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
    const inputs = this.inputArray;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    for (let i = 0; i < inputs.length; i++) {
      this.drawTouchPoint(inputs[i][0] * this.ctx.canvas.width / 100, inputs[i][1] * this.ctx.canvas.height / 100);
    }
  }

  setupCanvas(ref: Element) {
    // We have nothing to do if we're given the same canvas as previous.
    if (this.canvas === ref) {
      return;
    }

    // Setup canvas element
    this.canvas = ref;
    if (!this.canvas) {
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.ctx.canvas.width = ref.parentElement.offsetWidth;
    this.ctx.canvas.height = ref.parentElement.offsetHeight;
  }

  render() {
    return (
       <canvas className="base_multi_touch_trigger touchpanel" ref={(ref: Element) => {this.setupCanvas(ref);}} />
    );
  }
}
