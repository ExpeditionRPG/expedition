import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {XMLElement, SettingsType} from '../reducers/StateTypes'
import {Choice} from '../reducers/QuestTypes'
import {RoleplayResult} from '../QuestParser'

export interface RoleplayStateProps {
  node: XMLElement;
  roleplay: RoleplayResult;
  settings: SettingsType;
}

export interface RoleplayDispatchProps {
  onChoice: (settings: SettingsType, node: XMLElement, index: number) => void;
}

export interface RoleplayProps extends RoleplayStateProps, RoleplayDispatchProps {};

const Roleplay = (props: RoleplayProps): JSX.Element => {
  var buttons: JSX.Element[] = props.roleplay.choices.map(function(choice: Choice): JSX.Element {
    return (
      <Button key={choice.idx} onTouchTap={() => props.onChoice(props.settings, props.node, choice.idx)}>{choice.text}</Button>
    );
  });
  return (
    <Card title={props.roleplay.title}>
      {props.roleplay.content}
      {buttons}
    </Card>
  );
}

export default Roleplay;


