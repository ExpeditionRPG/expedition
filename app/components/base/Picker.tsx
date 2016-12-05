import * as React from 'react';
import IconButton from 'material-ui/IconButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import theme from '../../theme';

interface PickerProps extends React.Props<any> {
  value: number | string;
  label: string;
  onDelta: (i: number) => any;
}

export default class Picker extends React.Component<PickerProps, {}> {
  render() {
    return (
      <div className="base_picker">
        <div className="controls">
          <IconButton onTouchTap={(e: any) => this.props.onDelta(-1)}><ChevronLeft/></IconButton>
          <div className="value">{this.props.label}: {this.props.value}</div>
          <IconButton onTouchTap={(e: any) => this.props.onDelta(1)}><ChevronRight/></IconButton>
        </div>
        <div className="subtext" id="subtext">{this.props.children}</div>
      </div>
    );
  }
}