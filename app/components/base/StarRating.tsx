// Inspired by https://github.com/lawrentiy/react-material-ui-rating

import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import {colors} from 'material-ui/styles'
import Star from 'material-ui/svg-icons/toggle/star'
import StarBorder from 'material-ui/svg-icons/toggle/star-border'
import StarHalf from 'material-ui/svg-icons/toggle/star-half'

export interface StarRatingProps {
  hintText?: boolean;
  onChange?: (rating: number) => any;
  quantity?: number;
  readOnly?: boolean;
  style?: any;
  value?: number;
}

export default class StarRating extends React.Component<StarRatingProps, {}> {
  render() {
    const ratings = [null, 'Hated it', 'Disliked it', 'It\'s OK', 'Liked it', 'Loved it'];
    const stars = [1,2,3,4,5].map((i: number): JSX.Element => {
      const onClick = this.props.readOnly ? undefined : this.props.onChange.bind(this, i);
      let star = null;

      const classes = ['star'];
      if (!this.props.readOnly) {
        classes.push('editable');
      }

      if (i <= this.props.value) {
        classes.push('filled');
        star = <Star color={colors.grey900} />;
      } else if (i <= this.props.value + 0.5) {
        classes.push('halfFilled');
        star = <StarHalf color={colors.grey900} />;
      } else {
        classes.push('outline');
        star = <StarBorder color={colors.grey600} />;
      }

      return <div key={i} className={classes.join(' ')}>
        <FlatButton disabled={this.props.readOnly} onTouchTap={() => { !this.props.readOnly && this.props.onChange(i); }}>
          {star}
        </FlatButton>
      </div>;
    });
    return <span className="starContainer">
      <div className="stars" style={this.props.style}>
        {stars}{this.props.quantity && <span className="quantity">({this.props.quantity})</span>}
      </div>
      {this.props.hintText && <div className="hint">{ratings[this.props.value]}</div>}
    </span>;
  }
}
