import * as React from 'react';
import theme from '../../theme';

interface MultiTouchTriggerProps extends React.Props<any> {
  onTouchChange: (touches: any) => any;
}

export default class MultiTouchTrigger extends React.Component<MultiTouchTriggerProps, {}> {
  ctx: any;
  canvas: any;
  numFingers: number

  _touchEvent(e: any) {
    if (e.touches.length != this.numFingers) {
      this.numFingers = e.touches.length;
      this.props.onTouchChange(this.numFingers);
    }
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this._drawTouchPoints(e.touches);
    e.preventDefault();
  }

  _drawTouchPoints(touches: any) {
    var radius = 36;
    this.ctx.fillStyle = "rgb(200,0,0)";
    for (var i = 0; i < touches.length; i++) {
      this.ctx.beginPath();
      this.ctx.arc(touches[i].clientX, touches[i].clientY, radius, 0, 2 * Math.PI, false);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(touches[i].clientX, touches[i].clientY, 1.2 * radius, 0, 2 * Math.PI, false);
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

    this._touchEvent({touches: [], preventDefault: ()=>{}});
  }

  render() {
    return (
       <canvas className="base_multi_touch_trigger" ref={this.setupCanvas.bind(this)} />
    );
  }
}