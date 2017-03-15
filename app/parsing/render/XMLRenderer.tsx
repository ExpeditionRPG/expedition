import {Renderer, CombatChild, Instruction, RoleplayChild, sanitizeStyles} from './Renderer'

var cheerio: any = require('cheerio');

// TODO: Move error checks in this renderer to the QDLRenderer class.
export var XMLRenderer: Renderer = {
  toRoleplay: function(attribs: {[k: string]: string}, body: (string|RoleplayChild|Instruction)[], line: number): any {
    var roleplay = cheerio.load('<roleplay>')('roleplay');

    var keys = Object.keys(attribs);
    for (var i = 0; i < keys.length; i++) {
      roleplay.attr(keys[i], attribs[keys[i]]);
    }

    for (var i = 0; i < body.length; i++) {
      let section = body[i];
      if (typeof(section) === 'string') {
        let node = section as string;
        roleplay.append('<p>' + sanitizeStyles(node) + '</p>');
      } else if ((section as RoleplayChild).choice != null) { // choice
        let node = section as RoleplayChild;
        let choice = cheerio.load('<choice></choice>')('choice');
        choice.attr('text', sanitizeStyles(node.text));
        if (node.visible) {
          choice.attr('if', node.visible);
        }
        choice.append(node.choice);
        roleplay.append(choice);
      } else { // instruction
        let node = section as Instruction;
        let instruction = cheerio.load('<instruction></instruction>')('instruction');
        instruction.append('<p>' + sanitizeStyles(node.text) + '</p>');
        if (node.visible) {
          instruction.attr('if', node.visible);
        }
        roleplay.append(instruction);
      }
    }
    roleplay.attr('data-line', line);
    return roleplay;
  },

  toCombat: function(attribs: {[k: string]: any}, events: CombatChild[], line: number): any {
    var combat = cheerio.load('<combat></combat>')('combat');

    var keys = Object.keys(attribs);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== 'enemies') {
        combat.attr(keys[i], attribs[keys[i]]);
      }
    }

    var enemies = attribs['enemies'];
    for (var i = 0; i < enemies.length; i++) {
      var e = cheerio.load('<e>' + enemies[i].text + '</e>')('e');
      e.attr('if', enemies[i].visible);
      combat.append(e);
    }

    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      var currEvent: any = cheerio.load('<event></event>')('event');
      currEvent.attr('on', event.text.substr(3));
      if (event.visible) {
        currEvent.attr('if', event.visible);
      }
      for (var j = 0; j < event.event.length; j++) {
        currEvent.append(event.event[j]);
      }
      combat.append(currEvent);
    }
    combat.attr('data-line', line);
    return combat;
  },

  toTrigger: function(attribs: {[k: string]: any}, line: number): any {
    var trigger = cheerio.load('<trigger>'+attribs['text']+'</trigger>')('trigger');
    if (attribs['visible']) {
      trigger.attr('if', attribs['visible']);
    }
    trigger.attr('data-line', line);
    return trigger;
  },

  toQuest: function(attribs: {[k: string]: string}, line: number): any {
    var quest = cheerio.load('<quest>')('quest');
    var keys = Object.keys(attribs);
    for(var i = 0; i < keys.length; i++) {
      quest.attr(keys[i], attribs[keys[i]]);
    }
    quest.attr('data-line', line);
    return quest;
  },

  finalize: function(quest: any, inner: any[]): any {
    for (var i = 0; i < inner.length; i++) {
      quest.append(inner[i]);
    }
    return quest;
  },
};
