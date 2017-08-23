import * as React from 'react';

interface MultiTouchTriggerProps extends React.Props<any> {
  onTouchChange: (touches: any) => any;
}

const styles = {
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

// TODO: use new ES6 syntax
export default class MultiTouchTrigger extends React.Component<MultiTouchTriggerProps, {}> {
  ctx: any;
  canvas: any;
  inputArray: number[][];
  mouseDown: Boolean;
  private listeners: {[k: string]: () => void};
  private boundDrawTouchPoints: () => void;

  constructor(props: MultiTouchTriggerProps) {
    super(props);
    // We track bound listener functions in this way so we can unsubscribe
    // them later.
    this.listeners = {
      'touchstart': this.touchEvent.bind(this),
      'touchmove': this.touchEvent.bind(this),
      'touchend': this.touchEvent.bind(this),
      'mousedown': this.mouseDownEvent.bind(this),
      'mousemove': this.mouseMoveEvent.bind(this),
      'mouseup': this.mouseUpEvent.bind(this),
    };
    this.boundDrawTouchPoints = this.drawTouchPoints.bind(this);
  }

  private touchEvent(e: any) {
    const xyArray: number[][] = [];
    for (let i = 0; i < e.touches.length; i++) {
      xyArray.push([e.touches[i].clientX, e.touches[i].clientY]);
    }
    this.processInput(xyArray);
    e.preventDefault();
  }

  private mouseDownEvent(e: any) {
    this.mouseDown = true;
    this.processInput([[e.layerX, e.layerY]]);
  }

  private mouseMoveEvent(e: any) {
    if (this.mouseDown) {
      this.processInput([[e.layerX, e.layerY]]);
    }
  }

  private mouseUpEvent() {
    this.mouseDown = false;
    this.processInput([]);
  }

  private processInput(xyArray: number[][]) {
    if (!Boolean(this.inputArray) || xyArray.length !== this.inputArray.length) {
      this.props.onTouchChange(xyArray.length);
    }
    this.inputArray = xyArray;

    // Request a single animation frame every time our input values change,
    // instead of rendering continuously (saves render load).
    window.requestAnimationFrame(this.boundDrawTouchPoints);
  }

  private drawTouchPoints() {
    const inputs = this.inputArray;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    for (let i = 0; i < inputs.length; i++) {
      this.ctx.fillStyle = styles.center.color;
      this.ctx.beginPath();
      this.ctx.arc(inputs[i][0], inputs[i][1], styles.center.radius, 0, 2 * Math.PI, false);
      this.ctx.fill();
      this.ctx.strokeStyle = styles.ring.color;
      this.ctx.lineWidth = styles.ring.width;
      this.ctx.beginPath();
      this.ctx.arc(inputs[i][0], inputs[i][1], styles.ring.radius, 0, 2 * Math.PI, false);
      this.ctx.stroke();
    }
  }

  setupCanvas(ref: any) {
    // We have nothing to do if we're given the same canvas as previous.
    if (this.canvas === ref) {
      return;
    }

    // Setup canvas element and touch listeners
    this.destroyCanvas();
    this.canvas = ref;
    if (!this.canvas) {
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;
    for (const k of Object.keys(this.listeners)) {
      this.canvas.addEventListener(k, this.listeners[k]);
    }
    this.touchEvent({touches: [], preventDefault: ()=>{}});
  }

  private destroyCanvas() {
    if (!this.canvas) {
      return;
    }
    // Remove event listener references from canvas so they don't stick around.
    for (const k of Object.keys(this.listeners)) {
      this.canvas.removeEventListener(k, this.listeners[k]);
    }
  }

  componentWillUnmount() {
    this.destroyCanvas();
  }

  render() {
    return (
       <canvas className="base_multi_touch_trigger" ref={(ref: any) => {this.setupCanvas(ref);}} />
    );
  }
}
