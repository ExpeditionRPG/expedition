import * as React from 'react'
import theme from '../theme'
import Card from './base/Card'
import Button from './base/Button'
import {QuestDetails} from '../reducers/QuestTypes'
import {SettingsType} from '../reducers/StateTypes'

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

export interface AdvancedPlayStateProps {
  settings: SettingsType;
}

export interface AdvancedPlayDispatchProps {
  onSearchSelect: () => any;
  onCustomCombatSelect: (settings: SettingsType) => any;
}

export interface AdvancedPlayProps extends AdvancedPlayStateProps, AdvancedPlayDispatchProps {}

const AdvancedPlay = (props: AdvancedPlayProps): JSX.Element => {
  return (
    <Card title="Advanced Play">
      <Button onTouchTap={() => props.onSearchSelect()}>
        <div style={styles.container}>
          <div style={styles.metaTitle}>Browse Online Quests</div>
          <div style={styles.metaSummary}>Select from quests published by players around the world!</div>
        </div>
      </Button>
      <Button onTouchTap={() => props.onCustomCombatSelect(props.settings)}>
        <div style={styles.container}>
          <div style={styles.metaTitle}>Custom Combat</div>
          <div style={styles.metaSummary}>A streamlined combat-only mode for those telling their own quests.</div>
        </div>
      </Button>
    </Card>
  );
}

export default AdvancedPlay;