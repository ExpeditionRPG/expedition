import * as React from 'react';
import IconButton from 'material-ui/IconButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import theme from '../../theme';

interface PickerProps extends React.Props<any> {
  dark?: boolean;
  value: number | string;
  label: string;
  onDelta: (i: number) => any;
}

export default class Picker extends React.Component<PickerProps, {}> {
  style: any;

  constructor(props: any) {
    super(props);
    this.style = {
      picker: {
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
      },
      iconColor: (this.props.dark) ? "white" : "black",
      subtext: {
        fontSize: theme.fontSize.flavortext,
      },
      value: {
        flex: 10,
        marginTop: theme.vh.small,
        fontFamily: theme.card.headerFont,
      },
      pickerControls: {
        display: 'flex',
        flexDirection: 'row',
      },
    };
  }

  render() {
    return (
      <div className={"base_picker" + ((this.props.dark) ? " dark" : "")}>
        <div className="controls">
          <IconButton onTouchTap={(e) => this.props.onDelta(-1)}><ChevronLeft/></IconButton>
          <div className="value">{this.props.label}: {this.props.value}</div>
          <IconButton onTouchTap={(e) => this.props.onDelta(1)}><ChevronRight/></IconButton>
        </div>
        <div className="subtext" id="subtext">{this.props.children}</div>
      </div>
    );
  }
}