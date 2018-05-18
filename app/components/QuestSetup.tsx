import * as React from 'react'
import Callout from './base/Callout'
import Card from './base/Card'
import Button from './base/Button'
import {SettingsType} from '../reducers/StateTypes'

export interface QuestSetupStateProps {
  settings: SettingsType;
}

export interface QuestSetupDispatchProps {
  onNext: () => void;
}

export interface QuestSetupProps extends QuestSetupStateProps, QuestSetupDispatchProps {};

// TODO: Refactor this into a QUEST_CARD
const QuestSetup = (props: QuestSetupProps): JSX.Element => {
  const singlePlayer = (props.settings.numPlayers === 1);
  const twoAdventurer = (props.settings.numPlayers === 1 || props.settings.numPlayers === 2);
  const multiPlayer = (props.settings.numPlayers > 1);
  const theHorror = (props.settings.contentSets.horror === true);
  return (
    <Card title="Setup">
      <h2>Cards</h2>
      <p><strong>Separate</strong> cards into like piles (by ability class, enemy class, adventurers, etc).</p>

      <h2>Adventurers</h2>
      {singlePlayer && <p><strong>Solo play:</strong> Select two adventurers of your choice and set them face up in front of you.</p>}
      {multiPlayer && <p><strong>Select</strong> one adventurer of your choice from the deck, set it face up in front of you and pass the deck along.</p>}
      {twoAdventurer && <Callout icon="adventurer"><strong>1-2 players:</strong> We do not recommend using adventurers with music abilities.</Callout>}
      {theHorror && <Callout icon="horror"><strong>The Horror:</strong> Draw a persona card, set it face up in front of you, and attach a clip at "Base".</Callout>}
      <p><strong>Clip</strong> a health tracker onto your adventurer at full health (12).</p>

      <h2>Abilities</h2>
      <p><strong>Draw</strong> the starting abilities listed on your adventurer.</p>
      {twoAdventurer && <Callout icon="adventurer"><strong>1-2 players:</strong> Draft pick each ability (for each ability: draw three, keep one, return the other two to the bottom of the deck).</Callout>}
      {theHorror && <Callout icon="horror"><strong>The Horror:</strong> Draw an additional Influence ability and shuffle it into your ability pile (start with 7 abilities).</Callout>}
      <p><strong>Read</strong> through your abilities. You may mulligan (redraw all) once if desired.</p>
      <p><strong>Shuffle</strong> them into a stack face-down in front of you.</p>

      <h2>Sundries</h2>
      {singlePlayer && <p><strong>Gather</strong> a d20 die and helper card.</p>}
      {multiPlayer && <p>Give each player a helper card. Put the d20 die in the center. If you have extra d20, you can give one to each player.</p>}

      {multiPlayer && <p>
        During your adventure, each player should take turns reading a page from the story then passing this device to their right.
        {props.settings.multitouch && <span> During combat, place this device in the center of the table.</span>}
        {!props.settings.multitouch && <span> During combat, one player should manage the device.</span>}
      </p>}

      <Button onTouchTap={() => props.onNext()} remoteID="questsetup">Next</Button>
    </Card>
  );
}

export default QuestSetup;
