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

  _touchEvent(e: any) {
    const xyArray: number[][] = [];
    for (let i = 0; i < e.touches.length; i++) {
      xyArray.push([e.touches[i].clientX, e.touches[i].clientY]);
    }
    this._processInput(xyArray);
    e.preventDefault();
  }

  _mouseDownEvent(e: any) {
    this.mouseDown = true;
    this._processInput([[e.layerX, e.layerY]]);
  }

  _mouseMoveEvent(e: any) {
    if (this.mouseDown) {
      this._processInput([[e.layerX, e.layerY]]);
    }
  }

  _mouseUpEvent() {
    this.mouseDown = false;
    this._processInput([]);
  }

  _processInput(xyArray: number[][]) {
    if (!Boolean(this.inputArray) || xyArray.length !== this.inputArray.length) {
      this.props.onTouchChange(xyArray.length);
    }
    this.inputArray = xyArray;
  }

  _drawTouchPoints() {

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
    window.requestAnimationFrame(() => {this._drawTouchPoints(); });
  }

  setupCanvas(ref: any) {
    // Setup canvas element and touch listeners
    this.canvas = ref;
    if (!this.canvas) {
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;
    this.canvas.addEventListener('touchstart', this._touchEvent.bind(this));
    this.canvas.addEventListener('touchmove', this._touchEvent.bind(this));
    this.canvas.addEventListener('touchend', this._touchEvent.bind(this));
    this.canvas.addEventListener('mousedown', this._mouseDownEvent.bind(this));
    this.canvas.addEventListener('mousemove', this._mouseMoveEvent.bind(this));
    this.canvas.addEventListener('mouseup', this._mouseUpEvent.bind(this));

    this._touchEvent({touches: [], preventDefault: ()=>{}});
    window.requestAnimationFrame(() => {this._drawTouchPoints(); });
  }

  render() {
    return (
       <canvas className="base_multi_touch_trigger" ref={this.setupCanvas.bind(this)} />
    );
  }
}
