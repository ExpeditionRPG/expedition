// Inspired by https://github.com/lawrentiy/react-material-ui-rating

import * as React from 'react'
import {ToggleStarBorder, ToggleStar} from 'material-ui/svg-icons'
import {colors} from 'material-ui/styles'

export interface StarRatingProps {
  hintText?: boolean;
  onChange: (rating: number) => any;
  readOnly?: boolean;
  style?: any;
  value?: number;
}

const styles = {
  editable: {
    cursor: 'pointer',
  },
};

const Star = (props: any) => {
  let {checked, readOnly=false, ...p} = props;
  const st = readOnly ? {} : styles.editable;
  if (checked)
    return <ToggleStar className="star filled" style={st} color={colors.grey900} {...p}/>;
  else
    return <ToggleStarBorder className="star outline" style={st} color={colors.grey600} {...p}/>;
};

export default class StarRating extends React.Component<StarRatingProps, {}> {

  static defaultProps = {
    hintText: false,
    readOnly: false,
    style: {},
    value: 0,
  };

  constructor(props: StarRatingProps) {
    super(props);

    this.state = {
      checkedIndex: props.value,
    };
  }

  componentWillReceiveProps(nextProps: StarRatingProps): void {
    this.setState({checkedIndex: nextProps.value});
  }

  onCheck(i: number) {
    this.setState({checkedIndex: i});
    if (this.props.onChange) { this.props.onChange(i); }
  }

  ratingString(rating: number): string {
    const ratings = ['Hated it', 'Disliked it', 'It\'s OK', 'Liked it', 'Loved it'];
    return ratings[rating];
  }

  render() {
    const state = (this.state as any);
    const stars = [1,2,3,4,5].map((i: number) => {
      let onClick = this.props.readOnly ? undefined : this.onCheck.bind(this, i);
      let checked = (i <= state.checkedIndex);

      return <Star checked={checked}
        key={i}
        onTouchTap={onClick}
        readOnly={this.props.readOnly}
      />
    })
    return (<div className="starContainer" style={this.props.style}>
      {stars}
      {this.props.hintText && <div className="hint">{this.ratingString(this.props.value)}</div>}
    </div>)
  }
}
