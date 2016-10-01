import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {XMLElement} from '../reducers/StateTypes'

export interface RoleplayStateProps {
  node: XMLElement;
  icon: string;
  title: string;
  content: JSX.Element;
  actions: {text: string, idx: number}[];
}

export interface RoleplayDispatchProps {
  onChoice: (node: XMLElement, index: number) => void;
  onReturn: () => void;
}

export interface RoleplayProps extends RoleplayStateProps, RoleplayDispatchProps {};

const Roleplay = (props: RoleplayProps): JSX.Element => {
  var buttons: JSX.Element[] = props.actions.map(function(action: {text: string, idx: number}): JSX.Element {
    return (
      <Button key={action.idx} onTouchTap={() => props.onChoice(props.node, action.idx)}>{action.text}</Button>
    );
  });
  return (
    <Card title={props.title} onReturn={props.onReturn}>
      {props.content}
      {buttons}
    </Card>
  );
}

export default Roleplay;


