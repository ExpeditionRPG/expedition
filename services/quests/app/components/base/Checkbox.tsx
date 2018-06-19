import * as React from 'react'
import Button from '@material-ui/core/Button'
import CheckBoxIcon from '@material-ui/icons/checkbox'
import CheckBoxOutlineIcon from '@material-ui/icons/checkboxOutlineBlank'

export interface CheckboxProps {
  label: string;
  value: boolean;
  onChange: (checked: boolean) => any;
}

class ExpeditionCheckbox extends React.Component<CheckboxProps, {}> {
  render() {
    const icon = (this.props.value) ? <CheckBoxIcon/> : <CheckBoxOutlineIcon/>;
    return (
      <span className="creatorCheckbox">
        <Button onClick={(e: any) => this.props.onChange(!this.props.value)}>
          <div>
            <span className="icon">{icon}</span>
            <span className="label">{this.props.label}</span>
          </div>
          <div className="subtext" id="subtext">{this.props.children}</div>
        </Button>
      </span>
    );
  }
}

export default ExpeditionCheckbox;
