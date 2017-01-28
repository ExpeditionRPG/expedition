import * as React from 'react'
import {QuestContext} from 'expedition-app/app/reducers/QuestTypes'
import LeftIcon from 'material-ui/svg-icons/navigation/chevron-left'
import IconButton from 'material-ui/IconButton'

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

// We need a managed textarea to allow post-init overwriting
// of textarea value.
class OverrideTextArea extends React.Component<any, any> {
  state: {value: string};

  constructor(props: any) {
    super(props);
    this.state = {value: props.value || ""};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: any) {
    this.setState({value: event.target.value});
  }

  componentWillReceiveProps(nextProps: any) {
    this.setState({value: nextProps.value});
  }

  render() {
    return (
      <textarea value={this.state.value} onChange={this.handleChange} onBlur={this.props.onBlur} />
    );
  }
}

const ContextEditor = (props: ContextEditorProps): JSX.Element => {
  var KVs: any[] = [];
  for (let i = 0; i < props.scopeHistory.length; i++) {
    let scope = formatScope(props.scopeHistory[i]);
    KVs.push(<div key={i} className="scope">
      <IconButton tooltip="Play from Cursor" onTouchTap={(event: any) => props.onInitialContext(codifyScope(props.scopeHistory[i]))}>
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
        <h2 className="header">- Initial Context -</h2>
        <OverrideTextArea value={props.opInit} onBlur={(event: any) => props.onInitialContext(event.target.value)}></OverrideTextArea>
      </div>
      <div className="preview">
        <h2>- Context History -</h2>
        <div>
        {KVs}
        </div>
      </div>
    </div>
  );
};

export default ContextEditor;