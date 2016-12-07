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
  /*
  var safeScope = (props.context && props.context.scope) || {};

  var reactLines: any[] = [];
  for (var i = 0; i < props.console.output.length; i++) {
    reactLines.push(<p key={i}>{props.console.output[i]}</p>);
  }

  var KVs: any[] = [];
  var keys = Object.keys(safeScope);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var v = safeScope[k];
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
  */
  var scope =  <div className="scope">
        No variables currently in scope.
      </div>;
  var reactLines = [
    <div>Asdf</div>,
    <div>ghjk</div>,
    <div>Asdf</div>,
    <div>ghjk</div>,
    <div>Asdf</div>,
    <div>ghjk</div>,
    <div>Super long message that should really be multiple lines and wrap and stuff</div>,
    <div>ghjk</div>,
    <div>Asdf</div>,
    <div>ghjk</div>,
    <div>Asdf</div>,
    <div>ghjk</div>,
    <div>Asdf</div>,
    <div>ghjk</div>,
  ];
  return (
    <div className="console">
      <div className="interactive">
        <h2 className="header">
          Variable Console
        </h2>
        <div className="lines">
          {reactLines}
        </div>
        <div className="prompt">&gt; <input ref={(input) => {this.input = input;}} type="text" onKeyDown={(e: any) => {return props.handleKey(e)}}></input></div>
      </div>
      <div className="preview">
        <h2>App Context Variables</h2>

        {scope}
      </div>
    </div>
  );
};

export default ContextEditor;