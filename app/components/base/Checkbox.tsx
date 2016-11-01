import * as React from 'react'
import theme from '../../theme'
import FlatButton from 'material-ui/FlatButton'
import CheckBoxIcon from 'material-ui/svg-icons/toggle/check-box'
import CheckBoxOutlineIcon from 'material-ui/svg-icons/toggle/check-box-outline-blank'

export interface CheckboxProps {
  label: string;
  value: boolean;
  dark?: boolean;
  onChange: (checked: boolean) => any;
}

class ExpeditionCheckbox extends React.Component<CheckboxProps, {}> {
  style: any;

  constructor(props: any) {
    super(props);
    this.style = {
      checkbox: {
        height: 'auto',
        display: 'block',
        fontSize: theme.fontSize.interactive,
        padding: theme.vw.base,
        paddingTop: theme.vh.base,
        paddingBottom: theme.vh.base,
        margin: 0,
        marginTop: theme.vh.base,
        border: theme.border.accent,
        backgroundColor: (this.props.dark) ? theme.colors.backgroundColorDarkInteractive : theme.colors.backgroundColorInteractive,
        textAlign: 'center',
        textTransform: 'none',
        textDecoration: 'none',
        color: 'inherit',
        width: '100%',
      },
      label: {
        fontSize: theme.fontSize.interactive,
        fontFamily: theme.card.headerFont,
      },
      icon: {
        display: "inline-block",
        top: theme.vh.tiny,
        marginLeft: theme.vh.tiny,
        position: "relative",
      },
      subtext: {
        fontSize: theme.fontSize.flavortext,
      },
    };
  }

  render() {
    var icon = (this.props.value) ? <CheckBoxIcon/> :  <CheckBoxOutlineIcon/>;
    return (
      <span className={"base_checkbox" + ((this.props.dark) ? " dark" : "")}>
        <FlatButton onTouchTap={(e) => this.props.onChange(!this.props.value)}>
          <div>
            <span className="label">{this.props.label}</span>
            <span className="icon">{icon}</span>
          </div>
          <div className="subtext" id="subtext">{this.props.children}</div>
        </FlatButton>
      </span>
    );
  }
}

export default ExpeditionCheckbox;