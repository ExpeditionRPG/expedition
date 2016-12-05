import * as React from 'react'
import {QuestContext} from 'expedition-app/app/reducers/QuestTypes'
import MathJSConsole from './base/MathJSConsole'

interface MathJSConsoleState {
  history: any[];
  output: any[];
  idx: number;
}

export interface ContextEditorStateProps {
  console: MathJSConsoleState;
  context: QuestContext;
}

export interface ContextEditorDispatchProps {
  handleKey: (e: any) => any;
}

interface ContextEditorProps extends ContextEditorStateProps, ContextEditorDispatchProps {}

const ContextEditor = (props: ContextEditorProps): JSX.Element => {
  var safeScope = props.context.scope || {};

  var reactLines: any[] = [];
  for (var i = 0; i < this.state.output.length; i++) {
    reactLines.push(<p key={i}>{this.state.output[i]}</p>);
  }

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

  var scope: any;
  if (KVs.length > 0) {
    scope = (
      <div className="scope">
        {KVs}
      </div>
    );
  } else {
    scope = (
      <div className="scope">
        No variables currently in scope.
      </div>
    );
  }

  return (
    <div>
      {scope}
      <div className="console">
        <div className="lines">
          {reactLines}
        </div>
        <div className="prompt">&gt; <input ref={(input) => {this.input = input;}} type="text" onKeyDown={(e: any) => {return props.handleKey(e)}}></input></div>
      </div>
    </div>
  );
};

export default ContextEditor;