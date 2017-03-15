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
import {QuestType, ShareType, DialogsState, DialogIDType} from '../reducers/StateTypes'
import theme from '../theme'

declare var ga: any;

interface ErrorDialogProps extends React.Props<any> {
  open: boolean;
  errors: ErrorType[];
  onRequestClose: ()=>void;
}

export class ErrorDialog extends React.Component<ErrorDialogProps, {}> {
  render() {
    var errors: ErrorType[] = [];
    for (var i = 0; i < this.props.errors.length; i++) {
      var error = this.props.errors[i];
      ga('send', 'event', 'error', error.name, error.message);
      console.log(error.stack);
      errors.push(<div key={i}>{error.toString()}</div>);
    }

    return (
      <Dialog
        title="Errors Occurred"
        actions={[<RaisedButton
          label="OK"
          primary={true}
          onTouchTap={() => this.props.onRequestClose()}
        />]}
        titleClassName={'dialogTitle dialogError'}
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
        actions={[<RaisedButton
          label="OK"
          primary={true}
          onTouchTap={() => this.props.onRequestClose()}
        />]}
        titleClassName={'dialogTitle dialogGood'}
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
        actions={[<RaisedButton
          label="OK"
          primary={true}
          onTouchTap={() => this.props.onRequestClose()}
        />]}
        titleClassName={'dialogTitle'}
        modal={false}
        open={Boolean(this.props.open)}>
        Your quest is no longer visible in the Expedition App.
      </Dialog>
    );
  }
}

export interface DialogsStateProps {
  open: DialogsState;
  quest: QuestType;
  errors: ErrorType[];
};

export interface DialogsDispatchProps {
  onRequestClose: (dialog: DialogIDType)=>void;
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
    </span>
  );
}

export default Dialogs;
