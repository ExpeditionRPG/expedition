import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import {ContentSetsType} from 'app/reducers/StateTypes';
import * as React from 'react';
import {CONTENT_SET_FULL_NAMES, Expansion} from 'shared/schema/Constants';
import {CombatPhase, StateProps as StatePropsBase} from './Types';

export interface StateProps extends StatePropsBase {
  mostRecentRolls?: number[];
  contentSets: Set<keyof ContentSetsType>;
}

export interface DispatchProps {
  onNext: (phase: CombatPhase) => void;
  onReturn: () => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function resolve(props: Props): JSX.Element {
  let helpText: JSX.Element = (<p>Resolve all played abilities.</p>);
  if (props.settings.showHelp) {
    helpText = (
      <span>
        {props.contentSets.has(Expansion.horror) && <div>
          <h2>{CONTENT_SET_FULL_NAMES.horror} <img className="inline_icon" src="images/horror_white_small.svg"></img></h2>
          <p>Adventurers at Min persona must resolve their persona effect and reset to Base persona before resolving abilities. Adventurers at Max persona may choose to resolve and reset now or in a later round.</p>
        </div>}
        <h2>Roll <img className="inline_icon" src="images/roll_white_small.svg"></img></h2>
        <p>
          Each adventurer rolls a die for each ability they played. If <img className="inline_icon" src="images/roll_white_small.svg"></img> &ge; X, the ability succeeds. Ability cards may list additional effects based on the roll, even if they fail.
        </p>
        <h2>Resolve & Discard <img className="inline_icon" src="images/cards_white_small.svg"></img></h2>
        <p>
          <strong>Resolve</strong> your abilities in any order. You may change the resolution order during the round, even after some abilities have been played.
        </p>
        <p>
          <strong>Discard</strong> all ability(s) you resolved this round. Put unplayed abilities back into your draw pile before shuffling.
        </p>
        <h2>Modifiers <img className="inline_icon" src="images/damage_white_small.svg"></img></h2>
        <p>
          Enemies may have modifiers on their cards that affect the damage they receive. The modifier applies to the final damage value of each card played against them.
        </p>

      </span>
    );
  }
  let renderedRolls: JSX.Element[]|null = null;
  if (props.settings.autoRoll && props.mostRecentRolls) {
    renderedRolls = props.mostRecentRolls.map((roll: number, index: number) => {
      return (<div className="roll" key={index}>{roll}</div>);
    });
  }

  return (
    <Card title="Roll &amp; Resolve" theme="dark" inQuest={true} onReturn={() => props.onReturn()}>
      {helpText}
      {renderedRolls &&
        <div>
          {props.settings.showHelp && <p>Resolve your abilities with the following rolls. Start with the last person to read the quest and go clockwise:</p>}
          <div className="rolls">{renderedRolls}</div>
        </div>
      }
      <Button onClick={() => props.onNext(CombatPhase.resolveDamage)}>Next</Button>
    </Card>
  );
}
