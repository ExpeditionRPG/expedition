/// <reference path="../../typings/custom/require.d.ts" />

import {Block} from './BlockList'
import {BlockMsg, BlockMsgHandler} from './BlockMsg'
import {XMLElement} from '../reducers/StateTypes'

export interface BlockRenderer {
 toRoleplay: (attribs: {[k: string]: string}, body: (string|{text: string, choice: any})[]) => any;
 toCombat: (enemies: string[], events: {[evt: string]: Block[]}) => any;
 toTrigger: (text: string) => any;
 toQuest: (title: string, attribs: {[k: string]: string}) => any;
 finalize: (quest: any, inner: any[]) => any;
}

var cheerio: any = require('cheerio');

declare type OutMsgs = {dbgStr: string, msgs: BlockMsg[]};

// TODO: Move error checks in this renderer to the QDLRenderer class.
export class XMLRenderer {
  static toRoleplay(attribs: {[k: string]: string}, body: (string|{text: string, choice: any})[]): any {
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
        var c = section as {text: string, choice: any};
        var choice = cheerio.load('<choice></choice>')('choice');
        choice.attr('text', c.text);
        choice.append(c.choice);
        roleplay.append(choice);
      }
    }
    return roleplay;
  }

  static toCombat(enemies: string[], events: {[evt: string]: any}): any {
    var combat = cheerio.load('<combat></combat>')("combat");

    for (var i = 0; i < enemies.length; i++) {
      var e = cheerio.load('<e>'+enemies[i]+'</e>');
      combat.append(e('e'));
    }

    var eventKeys = Object.keys(events);
    for (var i = 0; i < eventKeys.length; i++) {
      var k = eventKeys[i];
      var currEvent: any = cheerio.load('<event></event>')('event');
      currEvent.attr('on', k);
      for (var j = 0; j < events[k].length; j++) {
        currEvent.append(events[k][j]);
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