import * as React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

import {ContentSetsType, DialogIDType, DialogState} from '../../reducers/StateTypes'

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
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>,
          <FlatButton className="primary" onTouchTap={() => this.props.onExitQuest()}>Exit</FlatButton>
        ]}
      >
        <p>Tapping exit will lose your place in the quest and return you to the home screen.</p>
      </Dialog>
    );
  }
}

interface ExpansionSelectDialogProps extends React.Props<any> {
  open: boolean;
  onExpansionSelect: (contentSets: ContentSetsType) => void;
}

// TODO November: once The Horror is available for purchase, add a buy button that links to Expedition store page
// https://github.com/ExpeditionRPG/expedition-app/issues/476
export class ExpansionSelectDialog extends React.Component<ExpansionSelectDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="Choose Game"
        modal={true}
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        actions={[]}
      >
        <FlatButton className="primary large" onTouchTap={() => this.props.onExpansionSelect({horror: false})}>Expedition</FlatButton>
        <br/>
        <br/>
        <FlatButton className="primary large" onTouchTap={() => this.props.onExpansionSelect({horror: true})}><span className="line">Expedition</span> <span className="line">+ The Horror</span></FlatButton>
        <p style={{textAlign: 'center', marginTop: '1.5em'}}>This will only appear once, but you can always change it in Settings.</p>
      </Dialog>
    );
  }
}

export interface DialogsStateProps {
  dialog: DialogState;
};

export interface DialogsDispatchProps {
  onExitQuest: () => void;
  onExpansionSelect: (contentSets: ContentSetsType) => void;
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
      <ExpansionSelectDialog
        open={props.dialog && props.dialog.open === 'EXPANSION_SELECT'}
        onExpansionSelect={(contentSets: ContentSetsType) => props.onExpansionSelect(contentSets)}
      />
    </span>
  );
}

export default Dialogs;
