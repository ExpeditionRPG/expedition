import * as React from 'react';
import IconButton from 'material-ui/IconButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import theme from '../../theme';

interface NumberPickerProps extends React.Props<any> {
  dark?: boolean;
  value: number;
  label: string;
  onDecrement: (e:any) => any;
  onIncrement: (e:any) => any;
}

export default class NumberPicker extends React.Component<NumberPickerProps, {}> {
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
      <div style={this.style.picker}>
        <div style={this.style.pickerControls}>
          <IconButton style={{float: 'left'}} onTouchTap={(e) => this.props.onDecrement(e)} ><ChevronLeft color={this.style.iconColor} /></IconButton>
          <div style={this.style.value}>{this.props.label}: {this.props.value}</div>
          <IconButton style={{float: 'right'}} onTouchTap={(e) => this.props.onIncrement(e)}><ChevronRight color={this.style.iconColor} /></IconButton>
        </div>
        <div style={this.style.subtext} id="subtext">{this.props.children}</div>
      </div>
    );
  }
}