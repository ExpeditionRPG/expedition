import * as React from 'react'
import Button from '@material-ui/core/Button'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import MultiplayerRipple from '../multiplayer/MultiplayerRipple'

export interface CheckboxProps {
  label: string;
  value: boolean;
  id?: string;
  onChange: (checked: boolean) => any;
}

class ExpeditionCheckbox extends React.Component<CheckboxProps, {}> {
  render() {
    const icon = (this.props.value) ? <CheckBoxIcon/> : <CheckBoxOutlineIcon/>;
    return (
      <MultiplayerRipple id={this.props.id} className="base_checkbox">
        <Button onClick={(e: any) => this.props.onChange(!this.props.value)}>
          <div>
            <span className="label">{this.props.label}</span>
            <span className="icon">{icon}</span>
          </div>
          <div className="subtext" id="subtext">{this.props.children}</div>
        </Button>
      </MultiplayerRipple>
    );
  }
}

export default ExpeditionCheckbox;
