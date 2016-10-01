import * as React from 'react'
import theme from '../../theme'

const styles = {
  container: {
    paddingLeft: theme.vw.base,
  },
  subtext: {
    display: 'flex',
    paddingLeft: theme.vw.base,
    flex: '3',
    lineHeight: '1.2em',
    margin: 0,
    fontSize: theme.fontSize.flavortext,
  },
  label: {
    lineHeight: '1.2em',
    fontFamily: theme.card.headerFont,
    display: 'block',
    fontSize: theme.fontSize.interactive,
    marginBottom: theme.vh.small,
    top: 0,
  },
};

export interface CheckboxProps {
  label: string;
  value: boolean;
  onChange: (checked: boolean) => any;
}

export default class Checkbox extends React.Component<CheckboxProps, {}> {
  render() {
    return (
      <div>
        TODO Checkbox {this.props.label}
        {this.props.children}
      </div>
    );
  }
}

/*

<div class="input">
      <div id="label" class="label">
        {{label}} <paper-checkbox id="value" class="value" checked="{{value}}"></paper-checkbox>
      </div>
    </div>
    <div id="subtext" class="subtext"><content></content></div>
*/