import * as React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

import {DialogIDType, DialogState} from '../../reducers/StateTypes'


interface ExitQuestDialogProps extends React.Props<any> {
  open: boolean;
  onExitQuest: () => void;
  onRequestClose: () => void;
}

export class ExitQuestDialog extends React.Component<ExitQuestDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="Exit quest?"
        modal={true}
        contentStyle={{width: '90%'}}
        open={Boolean(this.props.open)}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>,
          <RaisedButton primary={true} onTouchTap={() => this.props.onExitQuest()}>Exit</RaisedButton>
        ]}
      >
        <p>Tapping exit will lose your place in the quest and return you to the home screen.</p>
      </Dialog>
    );
  }
}

export interface DialogsStateProps {
  dialog: DialogState;
};

export interface DialogsDispatchProps {
  onExitQuest: () => void;
  onRequestClose: () => void;
}

interface DialogsProps extends DialogsStateProps, DialogsDispatchProps {}

const Dialogs = (props: DialogsProps): JSX.Element => {
  return (
    <span>
      <ExitQuestDialog
        open={props.dialog && props.dialog.open === 'EXIT_QUEST'}
        onExitQuest={() => props.onExitQuest()}
        onRequestClose={() => props.onRequestClose()}
      />
    </span>
  );
}

export default Dialogs;
