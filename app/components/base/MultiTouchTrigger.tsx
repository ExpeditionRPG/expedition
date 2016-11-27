import * as React from 'react';
import theme from '../../theme';

interface MultiTouchTriggerProps extends React.Props<any> {
  onTouchChange: (touches: any) => any;
}

export default class MultiTouchTrigger extends React.Component<MultiTouchTriggerProps, {}> {
  ctx: any;
  canvas: any;
  numFingers: number;
  mouseDown: Boolean;

  _touchEvent(e: any) {
    var xyArray: number[][] = [];
    for (var i = 0; i < e.touches.length; i++) {
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
    if (xyArray.length != this.numFingers) {
      this.numFingers = xyArray.length;
      this.props.onTouchChange(this.numFingers);
    }
    this._drawTouchPoints(xyArray);
  }

  _drawTouchPoints(xyArray: number[][]) {
    var radius = 36;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "rgb(200,0,0)";
    for (var i = 0; i < xyArray.length; i++) {
      this.ctx.beginPath();
      this.ctx.arc(xyArray[i][0], xyArray[i][1], radius, 0, 2 * Math.PI, false);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(xyArray[i][0], xyArray[i][1], 1.2 * radius, 0, 2 * Math.PI, false);
      this.ctx.stroke();
    }
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
  }

  render() {
    return (
       <canvas className="base_multi_touch_trigger" ref={this.setupCanvas.bind(this)} />
    );
  }
}
