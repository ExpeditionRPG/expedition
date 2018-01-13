import * as React from 'react'
import Button from '../../components/base/Button'
import Callout from '../../components/base/Callout'
import Card from '../../components/base/Card'
import {SettingsType, CardThemeType} from '../../reducers/StateTypes'
import {Choice, RoleplayElement} from '../../reducers/QuestTypes'
import {TemplateContext, ParserNode} from '../TemplateTypes'

import REGEX from 'expedition-qdl/lib/Regex'

export interface RoleplayStateProps {
  node: ParserNode;
  prevNode?: ParserNode;
  settings: SettingsType;
  onReturn?: () => any;
}

export interface RoleplayDispatchProps {
  onChoice: (settings: SettingsType, node: ParserNode, index: number) => void;
  onRetry: () => void;
}

export interface RoleplayProps extends RoleplayStateProps, RoleplayDispatchProps {};

// Replaces :icon_name: with <img class="inline_icon" src="images/icon_name_small.svg">
// And [art_name] with <img class="art" src="images/art_name.svg">
// if [art_name] ends will _full, adds class="full"; otherwise displays at 50% size
function generateIconElements(content: string): JSX.Element {
  content = (content || '').replace(new RegExp(REGEX.ICON.source, 'g'), (match:string, group:string): string => {
      return `<img class="inline_icon" src="images/${group.toLowerCase()}_small.svg" />`;
    })
    .replace(new RegExp(REGEX.ART.source, 'g'), (match:string, group:string): string => {
      let imgName = `images/${group}`;
      let imgClass = 'artHalf';
      if (group.slice(-5) === '_full') {
        imgName = imgName.slice(0, -5);
        imgClass = 'artFull';
      }
      if (imgName.slice(-4) === '_png') {
        imgName = imgName.slice(0, -4) + '.png';
      } else {
        imgName = imgName + '.svg';
      }
      return `<div class="${imgClass}">
        <img class="art" src="${imgName.toLowerCase()}" />
      </div>`;
    });
  return <span dangerouslySetInnerHTML={{__html: content }} />;
}

export interface RoleplayResult {
  icon: string;
  title: string | JSX.Element;
  content: RoleplayElement[];
  choices: Choice[];
  ctx: TemplateContext;
}

export function loadRoleplayNode(node: ParserNode): RoleplayResult {
  // Append elements to contents
  const choices: Choice[] = [];
  let choiceCount = -1;
  const content: RoleplayElement[] = [];

  node.loopChildren((tag, c) => {
    let text = '';
    c = c.clone();

    // Accumulate 'choice' tags in choices[]
    if (tag === 'choice') {
      choiceCount++;
      if (!c.attr('text')) {
        throw new Error('<choice> inside <roleplay> must have "text" attribute');
      }
      text = c.attr('text');
      choices.push({jsx: generateIconElements(text), idx: choiceCount});
      return;
    }

    if (tag === 'event') {
      // This sometimes triggers on the boundaries between roleplay and combat.
      // TODO(scott): Find a more principled solution for these errors.
      console.warn('Warning: <roleplay> cannot contain <event>.');
      return;
    }

    const element: RoleplayElement = {
      type: 'text',
      jsx: <span></span>,
    };
    if (tag === 'instruction') {
      element.type = 'instruction';
      text = c.html();
      let icon = 'adventurer';

      // if there's an icon at the begining, replace default icon and remove that icon from text
      const matches = text.match(REGEX.ICON);
      if (matches && text.trim().indexOf('<p>' + matches[0]) === 0) {
        text = text.replace(matches[0], ''); // replace only the first occurence of the first icon
        icon = matches[0].replace(/:/g, '');
      }
      element.jsx = <Callout icon={icon}>{generateIconElements(text)}</Callout>;
    } else { // text
      text = c.toString();
      element.jsx = generateIconElements(text);
    }

    if (text !== '') {
      content.push(element);
    }
  });

  // Append a generic 'Next' button if there were no choices,
  // or an 'End' button if there's also an <End> tag.
  if (choices.length === 0) {
    // Handle custom generic next button text based on if we're heading into a trigger node.
    const nextNode = node.getNext();
    let buttonText = <span>Next</span>;
    if (nextNode && nextNode.getTag() === 'trigger') {
      const triggerText = nextNode.elem.text().toLowerCase().split(' ')[0].trim();
      switch(triggerText) {
        case 'end':
          buttonText = <span>The End</span>;
          break;
        case 'goto':
          break;
        default:
          throw new Error('Unknown trigger with text ' + triggerText);
      }
    }
    choices.push({jsx: buttonText, idx: 0});
  }

  return {
    title: generateIconElements(node.elem.attr('title')),
    icon: node.elem.attr('icon'),
    content,
    choices,
    ctx: node.ctx,
  };
}

const Roleplay = (props: RoleplayProps, theme: CardThemeType = 'LIGHT'): JSX.Element => {
  const rpResult = loadRoleplayNode(props.node);

  const renderedContent: JSX.Element[] = rpResult.content.map((element: RoleplayElement, idx: number): JSX.Element => {
    return <span key={idx}>{element.jsx}</span>;
  });

  const buttons: JSX.Element[] = rpResult.choices.map((choice: Choice): JSX.Element => {
    return (
      <Button key={choice.idx} onTouchTap={() => props.onChoice(props.settings, props.node, choice.idx)}>
        {choice.jsx}
      </Button>
    );
  });

  // If we just got out of combat (loss: adventurers = 0) and the quest is about to end, offer the choice to retry combat
  const prevNodeCombatAdventurers =
    props.prevNode && props.prevNode.getTag() === 'combat'
    && props.prevNode.ctx.templates.combat
    && props.prevNode.ctx.templates.combat.numAliveAdventurers;
  const nextNode = props.node.getNext();
  if (prevNodeCombatAdventurers === 0 && rpResult.choices.length === 1 && nextNode && nextNode.isEnd()) {
    buttons.unshift(
      <Button key={-1} onTouchTap={() => props.onRetry()}>
        Retry combat
      </Button>
    );
  }

  return (
    <Card title={rpResult.title} icon={rpResult.icon} inQuest={true} theme={theme} onReturn={props.onReturn}>
      {renderedContent}
      {buttons}
    </Card>
  );
}

export default Roleplay;
