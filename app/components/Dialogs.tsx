import * as React from 'react'
import {TouchTapEventHandler} from 'material-ui'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import LinkIcon from 'material-ui/svg-icons/content/link'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'
import Toggle from 'material-ui/Toggle'

import {DialogsState, DialogIDType, UserState} from '../reducers/StateTypes'
import theme from '../Theme'

declare var ga: any;

export interface DialogsStateProps {
  dialogs: DialogsState;
  user: UserState;
};

export interface DialogsDispatchProps {
  onRequestClose: (dialog: DialogIDType) => void;
}

interface DialogsProps extends DialogsStateProps, DialogsDispatchProps {}

// TODO: Input args should be way shorter than this
const Dialogs = (props: DialogsProps): JSX.Element => {
  return (
    <span>
    </span>
  );
}

export default Dialogs;
