import * as React from 'react'
import Button from '../../components/base/Button'
import Callout from '../../components/base/Callout'
import Card from '../../components/base/Card'
import {SettingsType} from '../../reducers/StateTypes'
import {ParserNode} from '../../parser/Node'
import {Choice, QuestContext, RoleplayElement} from '../../reducers/QuestTypes'

export interface RoleplayStateProps {
  node: ParserNode;
  settings: SettingsType;
}

export interface RoleplayDispatchProps {
  onChoice: (settings: SettingsType, node: ParserNode, index: number) => void;
}

export interface RoleplayProps extends RoleplayStateProps, RoleplayDispatchProps {};

// Replaces [icon_name] with <img class="inline_icon" src="images/icon_name.svg">
function generateIconElements(content: string): string {
  // \[([a-zA-Z_0-9]*)\]   Contents inside of []'s, only allowing for alphanumeric + _'s
  // /g                    Multiple times
  return content.replace(/\[([a-zA-Z_0-9]*)\]/g, (match:string, group:string): string => {
    return `<img class="inline_icon" src="images/${group}_small.svg">`;
  });
}

export interface RoleplayResult {
  icon: string;
  title: string;
  content: RoleplayElement[];
  choices: Choice[];
  ctx: QuestContext;
}

export function loadRoleplayNode(node: ParserNode): RoleplayResult {
  // Append elements to contents
  let choices: Choice[] = [];
  let choiceCount = -1;
  let content: RoleplayElement[] = [];

  node.loopChildren((tag, c) => {
    c = c.clone();

    // Accumulate 'choice' tags in choices[]
    if (tag === 'choice') {
      choiceCount++;
      if (!c.attr('text')) {
        throw new Error('<choice> inside <roleplay> must have "text" attribute');
      }
      const text = c.attr('text');
      choices.push({text: generateIconElements(text), idx: choiceCount});
      return;
    }

    if (tag === 'event') {
      throw new Error('<roleplay> cannot contain <event>.');
    }

    const element: RoleplayElement = {
      type: 'text',
      text: '',
    }
    if (tag === 'instruction') {
      element.type = 'instruction';
      element.text = c.html();
    } else { // text
      // If we received a Cheerio object, outerHTML will
      // not be defined. toString will be, however.
      // https://github.com/cheeriojs/cheerio/issues/54
      if (c.get(0).outerHTML) {
        element.text = c.get(0).outerHTML;
      } else if (c.toString) {
        element.text = c.toString();
      } else {
        throw new Error('Invalid element ' + c);
      }
    }

    element.text = generateIconElements(element.text);

    if (element.text !== '') {
      content.push(element);
    }
  });

  // Append a generic 'Next' button if there were no choices,
  // or an 'End' button if there's also an <End> tag.
  if (choices.length === 0) {
    // Handle custom generic next button text based on if we're heading into a trigger node.
    const nextNode = node.getNext();
    let buttonText = 'Next';
    if (nextNode && nextNode.getTag() === 'trigger') {
      const triggerText = nextNode.elem.text().toLowerCase().split(' ')[0].trim();
      switch(triggerText) {
        case 'end':
          buttonText = 'The End';
          break;
        case 'goto':
          break;
        default:
          throw new Error('Unknown trigger with text ' + triggerText);
      }
    }
    choices.push({text: buttonText, idx: 0});
  }

  let title = node.elem.attr('title');
  let icon = node.elem.attr('icon');
  return {
    title,
    icon,
    content,
    choices,
    ctx: node.ctx,
  };
}

// TODO(scott): Convert this into a Template class implementation
const Roleplay = (props: RoleplayProps): JSX.Element => {
  const rpResult = loadRoleplayNode(props.node)

  const renderedContent: JSX.Element[] = rpResult.content.map((element: RoleplayElement, idx: number): JSX.Element => {
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

  const buttons: JSX.Element[] = rpResult.choices.map((choice: Choice): JSX.Element => {
    return (
      <Button key={choice.idx} onTouchTap={() => props.onChoice(props.settings, props.node, choice.idx)}>
        <span dangerouslySetInnerHTML={{__html: choice.text}} />
      </Button>
    );
  });

  return (
    <Card title={rpResult.title} icon={rpResult.icon} inQuest={true}>
      {renderedContent}
      {buttons}
    </Card>
  );
}

export default Roleplay;


