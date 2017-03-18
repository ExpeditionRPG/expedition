import * as React from 'react'
import Button from './base/Button'
import Callout from './base/Callout'
import Card from './base/Card'
import {XMLElement, SettingsType} from '../reducers/StateTypes'
import {Choice, QuestContext, RoleplayElement} from '../reducers/QuestTypes'
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
  const content: JSX.Element[] = props.roleplay.content.map((element: RoleplayElement, idx: number): JSX.Element => {
    switch (element.type) {
      case 'instruction':
        const matches = element.text.match(/src="images\/([a-zA-Z0-9_]*)/);
        let icon = 'adventurer';
        let text = element.text;
        // if there's an icon at the begining, replace default icon and remove that icon from text
        if (matches && element.text.trim().indexOf('<p><img') === 0) {
          icon = matches[1].replace('_small', '');
          text = text.replace(/<img class="inline_icon" src="images\/([a-zA-Z0-9_]*)_small\.svg">/, '');
        }
        return (
          <Callout key={idx} icon={icon}>
            <span dangerouslySetInnerHTML={{__html: text}} />
          </Callout>
        );
      case 'text':
      default:
        return <span key={idx} dangerouslySetInnerHTML={{__html: element.text}} />;
    }
  });
  const buttons: JSX.Element[] = props.roleplay.choices.map((choice: Choice): JSX.Element => {
    return (
      <Button key={choice.idx} onTouchTap={() => props.onChoice(props.settings, props.node, choice.idx, props.ctx)}>
        <span dangerouslySetInnerHTML={{__html: choice.text}} />
      </Button>
    );
  });

  return (
    <Card title={props.roleplay.title}>
      {content}
      {buttons}
    </Card>
  );
}

export default Roleplay;


