
var math = require('mathjs') as any;

import * as React from 'react'
import {ConsoleHistory} from '../../reducers/StateTypes'

interface MathJSConsoleProps extends React.Props<any> {
  mutableScope: any;
  history: ConsoleHistory;
  onCommand: (command: string, result: string) => any;
}

interface MathJSConsoleState {
  idx: number;
}

export default class MathJSConsole extends React.Component<MathJSConsoleProps, MathJSConsoleState> {
  input: any;

  constructor(props: MathJSConsoleProps) {
    super(props);
    this.state = {idx: 0};
  }

  handleKey(e: any): boolean {
    switch (e.key) {
      case 'ArrowUp':
        var i = Math.max(this.state.idx-1, 0);
        console.log('EUP ' + i);
        if (this.props.history.length === 0) {
          this.input.value = '';
        } else {
          this.input.value = this.props.history[i].command;
        }
        this.setState({idx: i});
        e.stopPropagation();
        return false;
      case 'ArrowDown':
        var i = Math.min(this.state.idx+1, this.props.history.length);
        console.log('EDN ' + i);
        if (i === this.props.history.length) {
          this.input.value = "";
        } else {
          this.input.value = this.props.history[i];
        }
        this.setState({idx: i});
        e.stopPropagation();
        return false;
      case 'Enter':
        var command = this.input.value;
        var output: string
        try {
          output = math.eval(command, this.props.mutableScope);
        } catch (e) {
          output = e.message;
        }
        this.input.value = '';
        this.props.onCommand(command, output+'');
        e.stopPropagation();
        return false;
      default:
        return true;
    }
  }

  render() {
    var lines: any[] = [];
    for (var i = 0; i < this.props.history.length; i++) {
      lines.push(<div key={i + 'c'}>&gt; {this.props.history[i].command}</div>);
      lines.push(<div key={i}>{this.props.history[i].result}</div>);
    }

    return (
      <div className="mathJSConsole">
        <div className="lines">
          {lines}
        </div>
        <div className="prompt">&gt; <input ref={(input) => {this.input = input;}} type="text" onKeyDown={(e: any) => {return this.handleKey(e)}}></input></div>
      </div>
    );
  }
}