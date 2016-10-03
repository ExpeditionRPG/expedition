import * as React from 'react'
import theme from '../theme'
import Card from './base/Card'
import Button from './base/Button'
import {QuestDetails} from '../reducers/QuestTypes'

const styles = {
  container: {
    paddingLeft: theme.vw.base,
  },
  metaSummary: {
    display: 'flex',
    paddingLeft: theme.vw.base,
    flex: '3',
    lineHeight: '1.2em',
    margin: 0,
    fontSize: theme.fontSize.flavortext,
  },
  metaTitle: {
    lineHeight: '1.2em',
    fontFamily: theme.card.headerFont,
    display: 'block',
    fontSize: theme.fontSize.interactive,
    marginBottom: theme.vh.small,
    top: 0,
  },
};

export interface FeaturedQuestsStateProps {
  quests: QuestDetails[];
}

export interface FeaturedQuestsDispatchProps {
  onQuestSelect: (quest: QuestDetails) => any;
  onAdvancedPlay: () => any;
}

export interface FeaturedQuestsProps extends FeaturedQuestsStateProps, FeaturedQuestsDispatchProps {}

const FeaturedQuests = (props: FeaturedQuestsProps): JSX.Element => {
  let items: JSX.Element[] = props.quests.map((quest: QuestDetails, index: number): JSX.Element => {
    return (
      <Button onTouchTap={() => props.onQuestSelect(quest)} key={index}>
        <div style={styles.container}>
          <div style={styles.metaTitle}>{quest.meta_title}</div>
          <div style={styles.metaSummary}>{quest.meta_summary}</div>
        </div>
      </Button>
    );
  });

  return (
    <Card title="Featured Quests">
      Select a quest below to get started, or click Advanced Play below for more options.
      {items}
      <Button onTouchTap={()=>props.onAdvancedPlay()}>Advanced Play</Button>
    </Card>
  );
}

export default FeaturedQuests;