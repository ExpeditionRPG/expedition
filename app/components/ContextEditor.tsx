import * as React from 'react'
import {ConsoleHistory} from '../reducers/StateTypes'
import {QuestContext} from 'expedition-app/app/reducers/QuestTypes'
import MathJSConsole from './base/MathJSConsole'

export interface ContextEditorStateProps {
  history: ConsoleHistory;
  scope: any;
}

export interface ContextEditorDispatchProps {
  onCommand: (history: ConsoleHistory, command: string, result: string) => any;
}

interface ContextEditorProps extends ContextEditorStateProps, ContextEditorDispatchProps {}

const ContextEditor = (props: ContextEditorProps): JSX.Element => {
  var KVs: any[] = [];
  var keys = Object.keys(props.scope);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var v = props.scope[k];
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
    <div className="console">
      <div className="interactive">
        <h2 className="header">
          Variable Console
        </h2>
        <MathJSConsole
          mutableScope={props.scope}
          history={props.history}
          onCommand={(command: string, result: string) => props.onCommand(props.history, command,result)}/>
      </div>
      <div className="preview">
        <h2>App Context Variables</h2>

        {scope}
      </div>
    </div>
  );
};

export default ContextEditor;