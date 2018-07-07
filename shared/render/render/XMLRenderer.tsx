import {Instruction, Renderer, sanitizeStyles} from './Renderer';
import {TemplateType, TemplateChild, EVENT_ATTRIBUTE_MAP, EVENT_ATTRIBUTE_SHORTHAND} from './Template';

const cheerio: any = require('cheerio') as CheerioAPI;

// from https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript
function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c: string) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// TODO: Move error checks in this renderer to the QDLRenderer class.
export const XMLRenderer: Renderer = {
  toTemplate(type: TemplateType, attribs: {[k: string]: any}, body: Array<string|TemplateChild|Instruction>, line: number): any {
    const tmpl = cheerio.load(`<${type}></${type}>`)(type);

    const attrName = EVENT_ATTRIBUTE_MAP[type];
    Object.keys(attribs).forEach((key) => {
      if (key != attrName) {
        tmpl.attr(key, attribs[key]);
      }
    });

    if (attrName !== null) {
      for (const v of attribs[attrName] || []) {
        const short = EVENT_ATTRIBUTE_SHORTHAND[attrName];
        const e = cheerio.load(`<${short}>${v.text}</${short}>`)(short);
        e.attr('if', v.visible);
        if (typeof(v.json) === 'object') {
          for (const k of Object.keys(v.json)) {
            e.attr(k, v.json[k]);
          }
        }
        tmpl.append(e);
      }
    }

    for (const section of body) {
      if (typeof(section) === 'string') {
        let text = section as string;
        const INITIAL_OP_WITH_PARAGRAPH = /^\s*{{(.*?)}}\s*[^\s]+/;
        const visible = (text.match(INITIAL_OP_WITH_PARAGRAPH) || [])[1];
        let paragraph = `<p>${sanitizeStyles(text)}</p>`;
        if (visible) {
          text = text.replace('{{' + visible + '}}', '');
          paragraph = `<p if="${escapeXml(visible)}">${sanitizeStyles(text)}</p>`;
        }
        tmpl.append(paragraph);
      } else if (Boolean((section as TemplateChild).outcome)) { // choice or event
        const node = section as TemplateChild;
        if (node.text.startsWith('on ')) {
          const currEvent: any = cheerio.load('<event></event>')('event');
          currEvent.attr('on', node.text.substr(3));
          if (node.visible) {
            currEvent.attr('if', node.visible);
          }
          const attributes = node.json;
          if (attributes) {
            Object.keys(attributes).forEach((key) => {
              currEvent.attr(key, attributes[key]);
            });
          }
          for (const ev of node.outcome) {
            currEvent.append(ev);
          }
          tmpl.append(currEvent);
        } else {
          const choice = cheerio.load('<choice></choice>')('choice');
          choice.attr('text', sanitizeStyles(node.text));
          if (node.visible) {
            choice.attr('if', node.visible);
          }
          choice.append(node.outcome);
          tmpl.append(choice);
        }
      } else { // instruction
        const node = section as Instruction;
        const instruction = cheerio.load('<instruction></instruction>')('instruction');
        instruction.append('<p>' + sanitizeStyles(node.text) + '</p>');
        if (node.visible) {
          instruction.attr('if', node.visible);
        }
        tmpl.append(instruction);
      }
    }

    if (line >= 0) {
      tmpl.attr('data-line', line);
    }
    return tmpl;
  },

  toTrigger(attribs: {[k: string]: any}, line: number): any {
    const trigger = cheerio.load('<trigger>' + attribs.text + '</trigger>')('trigger');
    if (attribs.visible) {
      trigger.attr('if', attribs.visible);
    }
    if (line >= 0) {
      trigger.attr('data-line', line);
    }
    return trigger;
  },

  toQuest(attribs: {[k: string]: string}, line: number): any {
    const quest = cheerio.load('<quest>')('quest');
    const keys = Object.keys(attribs);
    for (const key of keys) {
      quest.attr(key, attribs[key]);
    }
    if (line >= 0) {
      quest.attr('data-line', line);
    }
    return quest;
  },

  finalize(quest: any, inner: any[]): any {
    for (const el of inner) {
      quest.append(el);
    }
    return quest;
  },
};
