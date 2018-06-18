import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import CheckBoxIcon from 'material-ui/svg-icons/toggle/check-box'
import CheckBoxOutlineIcon from 'material-ui/svg-icons/toggle/check-box-outline-blank'

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
        <FlatButton onClick={(e: any) => this.props.onChange(!this.props.value)}>
          <div>
            <span className="icon">{icon}</span>
            <span className="label">{this.props.label}</span>
          </div>
          <div className="subtext" id="subtext">{this.props.children}</div>
        </FlatButton>
      </span>
    );
  }
}

export default ExpeditionCheckbox;
