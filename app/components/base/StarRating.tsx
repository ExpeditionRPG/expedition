// Inspired by https://github.com/lawrentiy/react-material-ui-rating

import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import {colors} from 'material-ui/styles'
import Star from 'material-ui/svg-icons/toggle/star'
import StarBorder from 'material-ui/svg-icons/toggle/star-border'

export interface StarRatingProps {
  hintText?: boolean;
  onChange: (rating: number) => any;
  readOnly?: boolean;
  style?: any;
  value?: number;
}

export default class StarRating extends React.Component<StarRatingProps, {}> {
  render() {
    const ratings = [null, 'Hated it', 'Disliked it', 'It\'s OK', 'Liked it', 'Loved it'];
    const stars = [1,2,3,4,5].map((i: number): JSX.Element => {
      const onClick = this.props.readOnly ? undefined : this.props.onChange.bind(this, i);
      const checked = (i <= this.props.value);
      let classes = 'star';
      if (!this.props.readOnly) {
        classes += ' editable';
      }
      if (checked) {
        classes += ' filled';
      } else {
        classes += ' outline';
      }

      return <div key={i} className={classes}>
        <FlatButton onTouchTap={() => { this.props.onChange(i) }}>
          {checked && <Star  color={colors.grey900} />}
          {!checked && <StarBorder color={colors.grey600} />}
        </FlatButton>
      </div>;
    });
    return (<div className="starContainer" style={this.props.style}>
      {stars}
      {this.props.hintText && <div className="hint">{ratings[this.props.value]}</div>}
    </div>);
  }
}
