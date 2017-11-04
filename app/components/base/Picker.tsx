import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left'
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import RemoteRipple from './remote/RemoteRipple'

interface PickerProps extends React.Props<any> {
  value: number | string;
  label: string;
  remoteID?: string;
  onDelta: (i: number) => any;
}

export default class Picker extends React.Component<PickerProps, {}> {
  render() {
    return (
      <div className="base_picker">
        <div className="controls">
          <RemoteRipple remoteID={(this.props.remoteID) ? this.props.remoteID + '-' : null}>
          <FlatButton
            onTouchTap={(e: any) => this.props.onDelta(-1)}
            icon={<ChevronLeft/>}
          />
          </RemoteRipple>
          <div className="value">{this.props.label}: {this.props.value}</div>
          <RemoteRipple remoteID={(this.props.remoteID) ? this.props.remoteID + '+' : null}>
          <FlatButton
            onTouchTap={(e: any) => this.props.onDelta(1)}
            icon={<ChevronRight/>}
          />
          </RemoteRipple>
        </div>
        <div className="subtext" id="subtext">{this.props.children}</div>
      </div>
    );
  }
}
