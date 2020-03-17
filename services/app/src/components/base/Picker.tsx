import IconButton from '@material-ui/core/IconButton';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import * as React from 'react';
import MultiplayerRippleContainer from '../multiplayer/MultiplayerRippleContainer';

export interface Props extends React.Props<any> {
  value: number | string;
  label: string;
  id?: string;
  onDelta: (i: number) => any;
}

export default class Picker extends React.Component<Props, {}> {
  public render() {
    return (
      <div className="base_picker">
        <div className="controls">
          <MultiplayerRippleContainer id={(this.props.id) ? this.props.id + '-' : undefined}>
          <IconButton onClick={(e: any) => this.props.onDelta(-1)}>
            <ChevronLeft/>
          </IconButton>
          </MultiplayerRippleContainer>
          <div className="value">{this.props.label}: {this.props.value}</div>
          <MultiplayerRippleContainer id={(this.props.id) ? this.props.id + '+' : undefined}>
          <IconButton onClick={(e: any) => this.props.onDelta(1)}>
            <ChevronRight/>
          </IconButton>
          </MultiplayerRippleContainer>
        </div>
        <div className="subtext" id="subtext">{this.props.children}</div>
      </div>
    );
  }
}
