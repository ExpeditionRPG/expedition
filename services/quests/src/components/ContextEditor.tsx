import Button from '@material-ui/core/Button';
import LeftIcon from '@material-ui/icons/ChevronLeft';
import * as React from 'react';
import {OverrideTextArea} from './base/OverrideTextArea';
import {ScrollBottom} from './base/ScrollBottom';

const math = require('mathjs');

export interface StateProps {
  scopeHistory: any[];
  opInit: string;
}

export interface DispatchProps {
  onInitialContext: (opInit: string) => void;
}

interface Props extends StateProps, DispatchProps {}

function codifyScope(scope: any): string {
  const keys = Object.keys(scope).sort();
  let result: string = '';
  for (const k of keys) {
    let v = scope[k];
    if (k === '_') { continue; }
    // MathJS functions stringify to verbose JS functions,
    // and self-referential `f(x) = f(x)` causes unlimited recursion.
    // Basic identity assignment works, but causes exceptions
    // on "hard restarts" where the function isn't previously defined.
    // We skip function assignment for now.
    if (typeof(v) === 'function') {
      result += '# ' + math.format(v) + ' (omitted)';
      continue;
    } else {
      v = math.format(v);
      result += k + ' = ' + v + '\n';
    }
  }
  return result;
}

function formatScope(scope: any): any[] {
  const keys = Object.keys(scope).sort();
  const KVs: any[] = [];
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = math.format(scope[k]);
    if (k === '_') { continue; }
    KVs.push(
      <div key={i}>
        <span>{k}</span>: <span>{v}</span>
      </div>
    );
  }
  return KVs;
}

// TODO: Rename to ContextPanel
const ContextEditor = (props: Props): JSX.Element => {
  const KVs: any[] = [];
  for (let i = 0; i < props.scopeHistory.length; i++) {
    const scope = formatScope(props.scopeHistory[i]);
    KVs.push(<Button key={i} onClick={(event: any) => props.onInitialContext(codifyScope(props.scopeHistory[i]))}>
      <LeftIcon/>
      <div>
        {scope}
      </div>
    </Button>);
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
        <OverrideTextArea
          placeholder={'# Write MathJS here to set context values\n# or click arrows from the context history on the right to populate.'}
          value={props.opInit}
          onBlur={(event: any) => props.onInitialContext(event.target.value)}></OverrideTextArea>
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
