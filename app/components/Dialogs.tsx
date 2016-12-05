import * as React from 'react'
import {TouchTapEventHandler} from 'material-ui'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import LinkIcon from 'material-ui/svg-icons/content/link'
import Paper from 'material-ui/Paper'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle'

import {ErrorType} from '../error'
import {QuestType, EditorState, ShareType, DialogsState, DialogIDType} from '../reducers/StateTypes'
import theme from '../theme'

var XMLParserError: any = (require('../../translation/to_markdown') as any).XMLParserError;
var MarkdownParserError: any = (require('../../translation/to_xml') as any).MarkdownParserError;

interface ErrorDialogProps extends React.Props<any> {
  open: boolean;
  errors: ErrorType[];
  onRequestClose: ()=>void;
}

const styles = {
  titleBad: {
    backgroundColor: '#E57373', // red 300
  },
  titleGood: {
    backgroundColor: '#AED581', // light green 300
  },
};


export class ErrorDialog extends React.Component<ErrorDialogProps, {}> {
  render() {
    var errors: ErrorType[] = [];
    for (var i = 0; i < this.props.errors.length; i++) {
      var error = this.props.errors[i];
      console.log(error.stack);

      if (error instanceof MarkdownParserError || error instanceof XMLParserError) {
        errors.push(<div key={i}>
          <strong>{error.name}: "{error.message}"</strong>
          <div><strong>Line:</strong> {error.line}</div>
          <div><strong>Usage:</strong> {error.usage}</div>
        </div>);
        continue;
      }
      errors.push(<div key={i}>{error.toString()}</div>);
    }

    return (
      <Dialog
        title="Errors Occurred"
        actions={<RaisedButton
          label="OK"
          primary={true}
          onTouchTap={() => this.props.onRequestClose()}
        />}
        overlayClassName={'dialog'}
        titleClassName={'dialogTitle'}
        titleStyle={styles.titleBad}
        modal={false}
        open={Boolean(this.props.open)}>
        {errors}
      </Dialog>
    );
  }
}

interface PublishedDialogProps extends React.Props<any> {
  open: boolean;
  onRequestClose: ()=>void;
}

export class PublishedDialog extends React.Component<PublishedDialogProps, {}> {
  render() {
    return (
      <Dialog
        title="Published!"
        actions={<RaisedButton
          label="OK"
          primary={true}
          onTouchTap={() => this.props.onRequestClose()}
        />}
        overlayClassName={'dialog'}
        titleClassName={'dialogTitle'}
        titleStyle={styles.titleGood}
        modal={false}
        open={Boolean(this.props.open)}>
        Your quest has been published and is now visible in the Expedition App.
      </Dialog>
    );
  }
}


interface UnpublishedDialogProps extends React.Props<any> {
  open: boolean;
  onRequestClose: ()=>void;
}

export class UnpublishedDialog extends React.Component<UnpublishedDialogProps, {}> {
  render() {
    return (
      <Dialog
        title="Unpublished"
        actions={<RaisedButton
          label="OK"
          primary={true}
          onTouchTap={() => this.props.onRequestClose()}
        />}
        overlayClassName={'dialog'}
        titleClassName={'dialogTitle'}
        modal={false}
        open={Boolean(this.props.open)}>
        Your quest is no longer visible in the Expedition App.
      </Dialog>
    );
  }
}


interface InitialStateDialogProps extends React.Props<any> {
  initialValue: string;
  open: boolean;
  onRequestClose: (v: any)=>void;
}

export class InitialStateDialog extends React.Component<InitialStateDialogProps, {}> {
  initstate: any;

  render() {
    return (
      <Dialog
        title="Initial State Script"
        actions={[<RaisedButton
          label="Cancel"
          primary={true}
          onTouchTap={() => this.props.onRequestClose(null)}
        />,
        <RaisedButton
          label="Save"
          primary={true}
          onTouchTap={() => this.props.onRequestClose(this.initstate.value)}
        />]}
        overlayClassName={'dialog'}
        titleClassName={'dialogTitle'}
        modal={false}
        open={Boolean(this.props.open)}>
        <p>
          Set the initial state of your quest by writing
          in <a href="http://mathjs.org/">MathJS here</a>.
        </p>
        <p>
          Your script will be run immediately before any "play" actions to populate the state of your quest.
        </p>
        <textarea className="initial_state" ref={(e: any) => {if (e) {e.value = this.props.initialValue; this.initstate = e;}}}/>
      </Dialog>
    );
  }
}


export interface DialogsStateProps {
  open: DialogsState;
  quest: QuestType;
  editor: EditorState;
  errors: ErrorType[];
};

export interface DialogsDispatchProps {
  onRequestClose: (dialog: DialogIDType)=>void;
  onCloseInitialContext: (newScope: any)=>void;
}

interface DialogsProps extends DialogsStateProps, DialogsDispatchProps {}

// TODO: Input args should be way shorter than this
const Dialogs = (props: DialogsProps): JSX.Element => {
  return (
    <span>
      <ErrorDialog
        open={props.open['ERROR']}
        onRequestClose={() => props.onRequestClose('ERROR')}
        errors={props.errors}
      />
      <PublishedDialog
        open={props.open['PUBLISHED']}
        onRequestClose={() => props.onRequestClose('PUBLISHED')}
      />
      <UnpublishedDialog
        open={props.open['UNPUBLISHED']}
        onRequestClose={() => props.onRequestClose('UNPUBLISHED')}
      />
      <InitialStateDialog
        open={props.open['INITIAL_STATE']}
        initialValue={props.editor.opInit}
        onRequestClose={(v: string) => props.onCloseInitialContext(v)}
      />
    </span>
  );
}

export default Dialogs;
