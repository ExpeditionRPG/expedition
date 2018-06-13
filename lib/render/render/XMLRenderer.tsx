import {Renderer, CombatChild, Instruction, RoleplayChild, sanitizeStyles} from './Renderer'

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
  toRoleplay: function(attribs: {[k: string]: string}, body: (string|RoleplayChild|Instruction)[], line: number): any {
    const roleplay = cheerio.load('<roleplay>')('roleplay');

    const keys = Object.keys(attribs);
    for (let i = 0; i < keys.length; i++) {
      roleplay.attr(keys[i], attribs[keys[i]]);
    }

    for (let i = 0; i < body.length; i++) {
      const section = body[i];
      if (typeof(section) === 'string') {
        let text = section as string;
        const INITIAL_OP_WITH_PARAGRAPH = /^\s*{{(.*?)}}\s*[^\s]+/;
        const visible = (text.match(INITIAL_OP_WITH_PARAGRAPH) || [])[1];
        let paragraph = `<p>${sanitizeStyles(text)}</p>`;
        if (visible) {
          text = text.replace('{{' + visible + '}}', '');
          paragraph = `<p if="${escapeXml(visible)}">${sanitizeStyles(text)}</p>`;
        }
        roleplay.append(paragraph);
      } else if (Boolean((section as RoleplayChild).choice)) { // choice
        const node = section as RoleplayChild;
        const choice = cheerio.load('<choice></choice>')('choice');
        choice.attr('text', sanitizeStyles(node.text));
        if (node.visible) {
          choice.attr('if', node.visible);
        }
        choice.append(node.choice);
        roleplay.append(choice);
      } else { // instruction
        const node = section as Instruction;
        const instruction = cheerio.load('<instruction></instruction>')('instruction');
        instruction.append('<p>' + sanitizeStyles(node.text) + '</p>');
        if (node.visible) {
          instruction.attr('if', node.visible);
        }
        roleplay.append(instruction);
      }
    }
    if (line >= 0) {
      roleplay.attr('data-line', line);
    }
    return roleplay;
  },

  toCombat: function(attribs: {[k: string]: any}, events: CombatChild[], line: number): any {
    const combat = cheerio.load('<combat></combat>')('combat');

    Object.keys(attribs).forEach((key) => {
      if (key !== 'enemies') {
        combat.attr(key, attribs[key]);
      }
    });

    const enemies = attribs['enemies'];
    for (let i = 0; i < enemies.length; i++) {
      const e = cheerio.load('<e>' + enemies[i].text + '</e>')('e');
      e.attr('if', enemies[i].visible);
      if (enemies[i].json && enemies[i].json.tier) {
        e.attr('tier', enemies[i].json.tier);
      }
      combat.append(e);
    }

    for (let i = 0; i < events.length; i++) {
      const currEvent: any = cheerio.load('<event></event>')('event');
      const event = events[i];
      currEvent.attr('on', event.text.substr(3));
      if (event.visible) {
        currEvent.attr('if', event.visible);
      }
      const attributes = event.json;
      if (attributes) {
        Object.keys(attributes).forEach((key) => {
          currEvent.attr(key, attributes[key]);
        });
      }
      for (let j = 0; j < event.event.length; j++) {
        currEvent.append(event.event[j]);
      }
      combat.append(currEvent);
    }
    if (line >= 0) {
      combat.attr('data-line', line);
    }
    return combat;
  },

  toTrigger: function(attribs: {[k: string]: any}, line: number): any {
    const trigger = cheerio.load('<trigger>'+attribs['text']+'</trigger>')('trigger');
    if (attribs['visible']) {
      trigger.attr('if', attribs['visible']);
    }
    if (line >= 0) {
      trigger.attr('data-line', line);
    }
    return trigger;
  },

  toQuest: function(attribs: {[k: string]: string}, line: number): any {
    const quest = cheerio.load('<quest>')('quest');
    const keys = Object.keys(attribs);
    for(let i = 0; i < keys.length; i++) {
      quest.attr(keys[i], attribs[keys[i]]);
    }
    if (line >= 0) {
      quest.attr('data-line', line);
    }
    return quest;
  },

  finalize: function(quest: any, inner: any[]): any {
    for (let i = 0; i < inner.length; i++) {
      quest.append(inner[i]);
    }
    return quest;
  },
};
