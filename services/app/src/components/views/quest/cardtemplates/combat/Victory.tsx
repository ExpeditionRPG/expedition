import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import {MAX_ADVENTURER_HEALTH, NODE_ENV} from 'app/Constants';
import {Enemy, EventParameters, Loot} from 'app/reducers/QuestTypes';
import {CardState, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
import * as React from 'react';
import {capitalizeFirstLetter, numberToWord, NUMERALS} from '../Render';
import {ParserNode} from '../TemplateTypes';
import {isSurgeNextRound, roundTimeMillis} from './Actions';
import {CombatPhase, CombatState} from './Types';

export interface StateProps {
  combat: CombatState;
  node: ParserNode;
  settings: SettingsType;
  victoryParameters?: EventParameters;
}

export interface DispatchProps {
  onCustomEnd: () => void;
  onEvent: (node: ParserNode, event: string) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default victory(props: Props); : JSX.Element; {
  const contents: JSX.Element[] = [];
  const theHorror = (props.settings.contentSets.horror === true);

  if (props.victoryParameters) {
    if (props.victoryParameters.heal && props.victoryParameters.heal > 0 && props.victoryParameters.heal < MAX_ADVENTURER_HEALTH) {
      contents.push(<p key="c1">All adventurers <strong>regain {props.victoryParameters.heal} health</strong> (even if at 0 health).</p>);
    } else if (props.victoryParameters.heal === 0) {
      contents.push(<p key="c1">Adventurers <strong>do not heal</strong>.</p>);
    } else {
      contents.push(<p key="c1">All adventurers heal to full health (even if at 0 health).</p>);
    }

    if (theHorror) {
      // Mimic <instruction> appearance
      contents.push(<div key="c1_horror" className="callout"><p><img className="inline_icon" src={`images/horror_white_small.svg`} /></p><div className="text"><p>The Horror: Keep your current Persona level.</p></div></div>);
    }

    if (props.victoryParameters.loot !== false && props.combat.loot && props.combat.loot.length > 0) {
      contents.push(
        <p key="c4">The party draws the following loot:</p>
      );
      const renderedLoot = props.combat.loot.map((loot: Loot, index: number) => {
        return (<li key={index}><strong>{capitalizeFirstLetter(numberToWord(loot.count))} tier {NUMERALS[loot.tier]} loot</strong></li>);
      });
      contents.push(<ul key="c5">{renderedLoot}</ul>);

      if (props.settings.showHelp) {
        contents.push(
          <span key="c6">
            <p>Divide the loot amongst adventurers. It can be used at any time and does not cost an action (unless otherwise specified).</p>
          </span>
        );
      }
    }

    if (props.victoryParameters.xp !== false && props.combat.levelUp) {
      contents.push(<span key="c2"><h3>LEVEL UP!</h3><p>All adventurers may learn a new ability:</p></span>);
      if (props.settings.showHelp) {
        contents.push(
          <ul key="c3">
            <li>Draw 3 abilities from one of the decks listed on your adventurer card.</li>
            {theHorror && <ul>
              <li><strong>The Horror:</strong> All adventurers may also draw from the Influence deck.</li>
            </ul>}
            <li>Add 1 to your ability deck, and place the remaining 2 at the bottom of the deck you drew from.</li>
            <li>You <i>may</i> choose to discard an ability.</li>
          </ul>
        );
      }
    }
  }

  return (
    <Card title="Victory" theme="dark" inQuest={true}>
      {props.settings.showHelp && <p>Shuffle all of your ability cards back into your ability draw pile.</p>}
      {contents}
      <Button onClick={() => (props.combat.custom) ? props.onCustomEnd() : props.onEvent(props.node, 'win')}>Next</Button>
    </Card>
  );
}
