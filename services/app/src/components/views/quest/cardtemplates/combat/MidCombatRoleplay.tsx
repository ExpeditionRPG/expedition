import {SettingsType} from 'app/reducers/StateTypes';
import Roleplay from '../roleplay/Roleplay';
import {ParserNode} from '../TemplateTypes';

export interface StateProps {
  maxTier: number;
  node: ParserNode;
  seed: string;
  settings: SettingsType;
}

export interface DispatchProps {
  onChoice: (node: ParserNode, settings: SettingsType, index: number, maxTier: number, seed: string) => void;
  onRetry: () => void;
  onReturn: () => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function midCombatRoleplay(props: Props): JSX.Element {
  return Roleplay({
    node: props.node,
    onChoice: (settings: SettingsType, node: ParserNode, index: number) => {props.onChoice(props.node, settings, index, props.maxTier, props.seed); },
    onRetry: () => {props.onRetry(); },
    onReturn: () => {props.onReturn(); },
    settings: props.settings,
  }, 'dark');
}
