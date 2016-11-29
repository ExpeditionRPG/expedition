/// <reference path="../../typings/custom/require.d.ts" />

import {Block} from './BlockList'
import {BlockMsg, BlockMsgHandler} from './BlockMsg'
import {XMLElement} from '../reducers/StateTypes'

export interface BlockRenderer {
 toRoleplay: (attribs: {[k: string]: string}, body: (string|{text: string, visible?: string, choice: any})[]) => any;
 toCombat: (attribs: {[k: string]: string}, events: ({text: string, visible?: string, event: any[]})[]) => any;
 toTrigger: (text: string) => any;
 toQuest: (title: string, attribs: {[k: string]: string}) => any;
 finalize: (quest: any, inner: any[]) => any;
}

var cheerio: any = require('cheerio');

declare type OutMsgs = {dbgStr: string, msgs: BlockMsg[]};

// TODO: Move error checks in this renderer to the QDLRenderer class.
export class XMLRenderer {
  static toRoleplay(attribs: {[k: string]: string}, body: (string|{text: string, visible?: string, choice: any})[]): any {
    var roleplay = cheerio.load('<roleplay>')('roleplay');

    var keys = Object.keys(attribs);
    for (var i = 0; i < keys.length; i++) {
      roleplay.attr(keys[i], attribs[keys[i]]);
    }

    for (var i = 0; i < body.length; i++) {
      var section = body[i];
      if (typeof(section) === 'string') {
        // TODO: Deeper markdown rendering of lines.
        // '/(\*\*|__)(.*?)\1/' => '<strong>\2</strong>',            // bold
        // '/(\*|_)(.*?)\1/' => '<em>\2</em>',                       // emphasis
        roleplay.append('<p>' + section + '</p>');
      } else {
        var c = section as {text: string, visible?: string, choice: any};
        var choice = cheerio.load('<choice></choice>')('choice');
        choice.attr('text', c.text);
        if (c.visible) {
          choice.attr('if', c.visible);
        }
        choice.append(c.choice);
        roleplay.append(choice);
      }
    }
    return roleplay;
  }

  static toCombat(attribs: {[k: string]: any}, events: ({text: string, visible?: string, event: any[]})[]): any {
    var combat = cheerio.load('<combat></combat>')("combat");

    var keys = Object.keys(attribs);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== 'enemies') {
        combat.attr(keys[i], attribs[keys[i]]);
      }
    }

    var enemies = attribs['enemies'];
    for (var i = 0; i < enemies.length; i++) {
      var e = cheerio.load('<e>'+enemies[i]+'</e>');
      combat.append(e('e'));
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
    return combat;
  }

  static toTrigger(text: string): any {
    return cheerio.load('<trigger>'+text+'</trigger>')('trigger');;
  }

  static toQuest(title: string, attribs: {[k: string]: string}): any {
    var quest = cheerio.load('<quest>')('quest');
    quest.attr('title', title);
    var keys = Object.keys(attribs);
    for(var i = 0; i < keys.length; i++) {
      quest.attr(keys[i], attribs[keys[i]]);
    }
    return quest;
  }

  static finalize(quest: any, inner: any[]): any {
    for (var i = 0; i < inner.length; i++) {
      quest.append(inner[i]);
    }
    return quest;
  }
}