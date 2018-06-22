import * as React from 'react'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import MultiplayerRipple from '../multiplayer/MultiplayerRipple'

interface PickerProps extends React.Props<any> {
  value: number | string;
  label: string;
  id?: string;
  onDelta: (i: number) => any;
}

export default class Picker extends React.Component<PickerProps, {}> {
  render() {
    return (
      <div className="base_picker">
        <div className="controls">
          <MultiplayerRipple id={(this.props.id) ? this.props.id + '-' : undefined}>
          <IconButton onClick={(e: any) => this.props.onDelta(-1)}>
            <ChevronLeft/>
          </IconButton>
          </MultiplayerRipple>
          <div className="value">{this.props.label}: {this.props.value}</div>
          <MultiplayerRipple id={(this.props.id) ? this.props.id + '+' : undefined}>
          <IconButton onClick={(e: any) => this.props.onDelta(1)}>
            <ChevronRight/>
          </IconButton>
          </MultiplayerRipple>
        </div>
        <div className="subtext" id="subtext">{this.props.children}</div>
      </div>
    );
  }
}
