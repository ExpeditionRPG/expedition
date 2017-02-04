import * as React from 'react'
import Button from './base/Button'
import Callout from './base/Callout'
import Card from './base/Card'
import {XMLElement, SettingsType} from '../reducers/StateTypes'
import {Choice, Instruction, QuestContext} from '../reducers/QuestTypes'
import {RoleplayResult} from '../QuestParser'

export interface RoleplayStateProps {
  node: XMLElement;
  roleplay: RoleplayResult;
  settings: SettingsType;
  ctx: QuestContext;
}

export interface RoleplayDispatchProps {
  onChoice: (settings: SettingsType, node: XMLElement, index: number, ctx: QuestContext) => void;
}

export interface RoleplayProps extends RoleplayStateProps, RoleplayDispatchProps {};

const Roleplay = (props: RoleplayProps): JSX.Element => {
  var buttons: JSX.Element[] = props.roleplay.choices.map(function(choice: Choice): JSX.Element {
    return (
      <Button key={choice.idx} onTouchTap={() => props.onChoice(props.settings, props.node, choice.idx, props.ctx)}>
        <span dangerouslySetInnerHTML={{__html: choice.text}} />
      </Button>
    );
  });

  var instructions: JSX.Element[] = props.roleplay.instructions.map(function(instruction: Instruction): JSX.Element {

    const matches = instruction.text.match(/src="images\/([a-zA-Z0-9_]*)/);
    let icon = 'adventurer';
    // if there's an icon at the begining, replace default icon and remove that icon from text
    if (matches && instruction.text.trim().indexOf('<p><img') === 0) {
      icon = matches[1].replace('_small', '');
      instruction.text = instruction.text.replace(/<img class="inline_icon" src="images\/([a-zA-Z0-9_]*)_small\.svg">/, '');
    }
    return (
      <Callout key={instruction.idx} icon={icon}>
        <span dangerouslySetInnerHTML={{__html: instruction.text}} />
      </Callout>
    );
  });

  return (
    <Card title={props.roleplay.title}>
      {props.roleplay.content}
      {instructions}
      {buttons}
    </Card>
  );
}

export default Roleplay;


