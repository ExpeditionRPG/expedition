// Inspired by https://github.com/lawrentiy/react-material-ui-rating
import * as React from 'react'
import IconButton from '@material-ui/core/Button'
import Star from '@material-ui/icons/Star'
import StarBorder from '@material-ui/icons/StarBorder'
import StarHalf from '@material-ui/icons/StarHalf'

export interface StarRatingProps {
  hintText?: boolean;
  onChange?: (rating: number) => any;
  quantity?: number;
  readOnly?: boolean;
  style?: any;
  value: number;
}

export default class StarRating extends React.Component<StarRatingProps, {}> {
  render() {
    const ratings = [null, 'Hated it', 'Disliked it', 'It\'s OK', 'Liked it', 'Loved it'];
    const stars = [1,2,3,4,5].map((i: number): JSX.Element => {
      let star = null;

      const classes = ['star'];
      if (!this.props.readOnly) {
        classes.push('editable');
      }

      if (i <= this.props.value) {
        classes.push('filled');
        star = <Star/>;
      } else if (i <= this.props.value + 0.5) {
        classes.push('filled');
        star = <StarHalf/>;
      } else {
        classes.push('outline');
        star = <StarBorder/>;
      }

      // TODO: Flatten this structure so ripples are circular
      return <div key={i} className={classes.join(' ')}>
        <IconButton disabled={this.props.readOnly} onClick={() => { !this.props.readOnly && this.props.onChange && this.props.onChange(i); }}>
          {star}
        </IconButton>
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
