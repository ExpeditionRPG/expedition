import * as React from 'react'
import theme from '../../theme'
import Card from './Card'
import Button from './Button'
import MultiTouchTrigger from './MultiTouchTrigger'
import {ListCardType, ListItemType} from '../../reducers/StateTypes'

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

export interface ListCardDispatchProps {
  onReturn: () => any;
  onListSelect: (item: ListItemType) => any;
}

interface ListCardProps extends ListCardType, ListCardDispatchProps {}

export default class ListCard extends React.Component<ListCardProps, {}> {
  render() {
    let items: JSX.Element[] = this.props.items.map((item: ListItemType, index: number): JSX.Element => {
      return (
        <Button onTouchTap={() => this.props.onListSelect(item)} key={index}>
          <div style={styles.container}>
            <div style={styles.label}>{item.primaryText}</div>
            <div style={styles.subtext}>{item.secondaryText}</div>
          </div>
        </Button>
      );
    });
    return (
      <Card onReturn={this.props.onReturn} title={this.props.title}>
        {this.props.hint}
        {items}
      </Card>
    );
  }
}