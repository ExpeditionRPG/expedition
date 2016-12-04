
var math = require('mathjs') as any;

import * as React from 'react'

interface MathJSConsoleProps extends React.Props<any> {
  scope: any;
}

interface MathJSConsoleState {
  history: any[];
  output: any[];
  idx: number;
}

export default class MathJSConsole extends React.Component<MathJSConsoleProps, MathJSConsoleState> {
  input: any;
  newScope: any;

  constructor(props: MathJSConsoleProps) {
    super(props);
    this.newScope = Object.assign({}, props.scope);
    this.state = {history: [], output: [], idx: 0};
  }

  public getNewScope() {
    return this.newScope;
  }

  handleKey(e: any): boolean {
    switch (e.key) {
      case 'ArrowUp':
        var i = Math.max(this.state.idx-1, 0);
        console.log('EUP ' + i);
        if (this.state.history.length === 0) {
          this.input.value = '';
        } else {
          this.input.value = this.state.history[i];
        }
        this.setState({history: this.state.history, output: this.state.output, idx: i});
        e.stopPropagation();
        return false;
      case 'ArrowDown':
        var i = Math.min(this.state.idx+1, this.state.history.length);
        console.log('EDN ' + i);
        if (i === this.state.history.length) {
          this.input.value = "";
        } else {
          this.input.value = this.state.history[i];
        }
        this.setState({history: this.state.history, output: this.state.output, idx: i});
        e.stopPropagation();
        return false;
      case 'Enter':
        console.log("TODO eval");
        var history = this.state.history;
        history.push(this.input.value);
        var output = this.state.output;

        try {
          output.push(math.eval(this.input.value, this.newScope));
        } catch (e) {
          output.push(e.message);
        }

        this.setState({history, output, idx: history.length});
        this.input.value = '';
        console.log(history);
        return false;
      default:
        return true;
    }
  }

  renderScope() {
    var KVs: any[] = [];
    var keys = Object.keys(this.newScope);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var v = this.newScope[k];
      if (typeof(v) === 'string' || typeof(v) === 'number') {
        KVs.push(
          <div>
            <span>{k}</span>: {v}
          </div>
        );
      } else {
        KVs.push(
          <div>
            <span>{k}</span>: &lt;{typeof(v)}&gt;
          </div>
        );
      }
    }

    if (KVs.length > 0) {
      return (
        <div className="scope">
          {KVs}
        </div>
      );
    } else {
      return (
        <div>
          No variables currently in scope.
        </div>
      );
    }
  }

  render() {
    var reactLines: any[] = [];
    for (var i = 0; i < this.state.output.length; i++) {
      reactLines.push(<p key={i}>{this.state.output[i]}</p>);
    }

    var scope = this.renderScope();

    return (
      <div>
        {scope}
        <div className="console">
          <div className="lines">
            {reactLines}
          </div>
          <div className="prompt">&gt; <input ref={(input) => {this.input = input;}} type="text" onKeyDown={(e: any) => {return this.handleKey(e)}}></input></div>
        </div>
      </div>
    );
  }
}