import * as React from 'react'
import LeftIcon from 'material-ui/svg-icons/navigation/chevron-left'
import IconButton from 'material-ui/IconButton'
import {OverrideTextArea} from './base/OverrideTextArea'
import {ScrollBottom} from './base/ScrollBottom'

var math = require('mathjs') as any;

export interface ContextEditorStateProps {
  scopeHistory: any[];
  opInit: string;
}

export interface ContextEditorDispatchProps {
  onInitialContext: (opInit: string) => void;
}

interface ContextEditorProps extends ContextEditorStateProps, ContextEditorDispatchProps {}

function codifyScope(scope: any): string {
  var keys = Object.keys(scope).sort();
  var result: string = "";
  for (var i = 0; i < keys.length; i++) {
    let k = keys[i];
    let v = scope[k];
    // MathJS functions stringify to verbose JS functions,
    // and self-referential `f(x) = f(x)` causes unlimited recursion.
    // Basic identity assignment works, but causes exceptions
    // on "hard restarts" where the function isn't previously defined.
    // We skip function assignment for now.
    if (typeof(v) === 'function') {
      result += "# " + math.format(v) + " (omitted)";
      continue;
    } else {
      v = math.format(v);
      result += k + " = " + v + "\n";
    }
  }
  return result;
}

function formatScope(scope: any): any[] {
  var keys = Object.keys(scope).sort();
  var KVs: any[] = [];
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var v = math.format(scope[k]);
    KVs.push(
      <div key={i}>
        <span>{k}</span>: <span>{v}</span>
      </div>
    );
  }
  return KVs;
}

const ContextEditor = (props: ContextEditorProps): JSX.Element => {
  var KVs: any[] = [];
  for (let i = 0; i < props.scopeHistory.length; i++) {
    let scope = formatScope(props.scopeHistory[i]);
    KVs.push(<div key={i} className="scope">
      <IconButton tooltip="Set initial context" onTouchTap={(event: any) => props.onInitialContext(codifyScope(props.scopeHistory[i]))}>
        <LeftIcon/>
      </IconButton>
      <div>
        {scope}
      </div>
    </div>);
  }
  if (KVs.length === 0) {
    KVs.push(<div key="noscope" className="noScope">
      <p>Empty scope history.</p>
      <p>Play until a card that assigns a variable, or define one in the initial context before clicking the Play button.</p>
    </div>);
  }
  return (
    <div className="console">
      <div className="interactive">
        <div>Initial Context: {'{{'}</div>
        <OverrideTextArea value={props.opInit} onBlur={(event: any) => props.onInitialContext(event.target.value)}></OverrideTextArea>
        <div>{'}}'}</div>
      </div>
      <div className="preview">
        <ScrollBottom>
          {KVs}
        </ScrollBottom>
      </div>
    </div>
  );
};

export default ContextEditor;