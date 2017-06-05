// Inspired by https://github.com/lawrentiy/react-material-ui-rating

import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import {colors} from 'material-ui/styles'
import Star from 'material-ui/svg-icons/toggle/star'
import StarBorder from 'material-ui/svg-icons/toggle/star-border'

export interface StarRatingProps {
  hintText?: boolean;
  onChange?: (rating: number) => any;
  quantity?: number; // parens number to the right of the stars, aka quantity of ratings
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
      // TODO support half-stars - https://github.com/ExpeditionRPG/expedition-app/issues/338
      if (checked) {
        classes += ' filled';
      } else {
        classes += ' outline';
      }

      return <div key={i} className={classes}>
        <FlatButton disabled={this.props.readOnly} onTouchTap={() => { !this.props.readOnly && this.props.onChange(i); }}>
          {checked && <Star color={colors.grey900} />}
          {!checked && <StarBorder color={colors.grey600} />}
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
