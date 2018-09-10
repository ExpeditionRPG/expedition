import * as React from 'react';

interface Props {
  text: string;
}

export default class TextDivider extends React.Component<Props, {}> {
  public render() {
    return (
      <div className="textDivider"><span>{this.props.text}</span></div>
    );
  }
}
