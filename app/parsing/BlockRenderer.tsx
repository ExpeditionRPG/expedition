/// <reference path="../../typings/custom/require.d.ts" />

import {Block} from './BlockList'
import {BlockMsg, BlockMsgHandler} from './BlockMsg'

export interface BlockRenderer {
 toRoleplay: (blocks: Block[], msg: BlockMsgHandler) => void;
 toCombat: (blocks: Block[], msg: BlockMsgHandler) => void;
 toTrigger: (blocks: Block[], msg: BlockMsgHandler) => void;
 toQuest: (blocks: Block[], msg: BlockMsgHandler) => void;
 finalize: (blocks: Block[], msg: BlockMsgHandler) => void;
}

var cheerio: any = require('cheerio');

const REGEXP_ITALIC = /\_(.*)\_.*/;
const REGEXP_EVENT = /\* on (.*)/;

const ERR_PREFIX = "Internal XML Parse Error: ";

declare type OutMsgs = {dbgStr: string, msgs: BlockMsg[]};

// TODO: Move error checks in this renderer to the QDLRenderer class.
export class XMLRenderer {
  static toRoleplay(blocks: Block[], msg: BlockMsgHandler) {
    var roleplay = cheerio.load('<roleplay>')('roleplay');

    var titleText = blocks[0].lines[0].match(REGEXP_ITALIC);
    if (titleText) {
      roleplay.attr('title', titleText[1]);
      this.applyAttributes(roleplay, blocks[0].lines[0]);
      blocks[0].lines = blocks[0].lines.splice(1);
    }

    // The only inner stuff
    var i = 0;
    while (i < blocks.length) {
      var block = blocks[i];
      if (block.render) {
        // Only the blocks within choices should be rendered at this point.
        throw new Error(ERR_PREFIX + "found unexpected block with render");
      }

      // Append rendered stuff
      var choice: any = this.renderRoleplayLines(roleplay, block.lines);
      if (choice) {
        // If we ended in a choice, continue through subsequent blocks until we end
        // up outside the choice block again.
        var inner = blocks[++i];
        while (i < blocks.length && inner.indent !== block.indent) {
          if (!inner.render) {
            throw new Error(ERR_PREFIX + "found unexpected block with no render");
          }
          choice.append(inner.render);
          i++;
          inner = blocks[i];
        }
      } else {
        i++;
      }
    }

    blocks[0].render = roleplay;
  };

  static toCombat(blocks: Block[], msg: BlockMsgHandler) {
    var combat = cheerio.load('<combat></combat>')("combat");
    var data = this.extractJSON(blocks[0].lines[0]);

    if (!data.enemies) {
      msg.err(
        "combat block has no enemies listed",
        "404",
        blocks[0].startLine
      );
      data.enemies = [];
    }

    for (var i = 0; i < data.enemies.length; i++) {
      var e = cheerio.load('<e>'+data.enemies[i]+'</e>');
      combat.append(e('e'));
    }

    blocks[0].lines.shift();

    var currEvent: any = null;
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      if (block.render) {
        if (!currEvent) {
          msg.err(
            "found inner block of combat block without an event bullet",
            "404",
            block.startLine
          );
          continue;
        }
        currEvent.append(block.render);
        continue;
      }

      for (var j = 0; j < block.lines.length; j++) {
        var line = block.lines[j];
        if (line === '') {
          continue;
        }

        // We should only ever see event blocks within the combat block.
        // These blocks are only single lines.
        var m = line.match(REGEXP_EVENT);
        if (!m) {
          // TODO: Return error here
          msg.err(
            "lines within combat block must be event bullets; instead found \""+line+"\"",
            "404",
            block.startLine + j
          );
          continue;
        }

        currEvent = cheerio.load('<event></event>')('event');
        currEvent.attr('on', m[1]);
        combat.append(currEvent);
      }
    }
    blocks[0].render = combat;
  }

  static toTrigger(blocks: Block[], msg: BlockMsgHandler) {
    var text = blocks[0].lines[0].match(REGEXP_ITALIC);
    if (text) {
      blocks[0].render = cheerio.load('<trigger>'+text[1]+'</trigger>')('trigger');;
    } else {
      msg.err(
        'could not parse trigger value from trigger',
        '404',
        blocks[0].startLine
      );
    }

    if (blocks.length !== 1) {
      msg.err(
        'trigger block group cannot contain multiple blocks',
        '404'
      );
    }
  }

  static toQuest(blocks: Block[], msg: BlockMsgHandler) {
    var quest = cheerio.load('<quest>')('quest');
    quest.attr('title', blocks[0].lines[0].substr(1));
    for(var i = 1; i < blocks[0].lines.length && blocks[0].lines[i] !== ''; i++) {
      var kv = blocks[0].lines[i].split(":");
      quest.attr(kv[0].toLowerCase(), kv[1].trim());
    }

    blocks[0].render = quest;
    // TODO: Disallow multiple blocks in quest root
    if (blocks.length !== 1) {
      msg.err(
        'quest block group cannot contain multiple blocks',
        '404'
      );
    }
  }

  static finalize(blocks: Block[], msg: BlockMsgHandler) {
    for (var i = 1; i < blocks.length; i++) {
      blocks[0].render.append(blocks[i].render);
    }

    if (blocks[0].render.get(0).name !== 'quest') {
      // Inject a <quest> if we don't have a quest header.
      msg.err("root block must be a quest header", "404", 0);
      var newRoot = cheerio.load('<quest>')('quest');
      newRoot.append(blocks[0].render);
      blocks[0].render = newRoot;
    }
  }

  private static extractJSON(line: string): any {
    var m = line.match(/(\{.*\})/);
    if (!m) {
      return {};
    }
    return JSON.parse(m[0]);
  }

  private static applyAttributes(elem: any, line: string) {
    var parsed = this.extractJSON(line);
    for (let k of Object.keys(parsed)) {
      elem.attr(k, parsed[k]);
    }
  }

  private static collate(lines: string[]): string[] {
    var result: string[] = [''];
    for (var i = 0; i < lines.length; i++) {
      if (lines[i] === '') {
        continue;
      }
      if (lines[i-1] === '' && result[result.length-1] !== '') {
        result.push('');
      }
      result[result.length-1] += (result[result.length-1] !== '') ? ' ' + lines[i] : lines[i];
    }
    return result;
  }

  // Render roleplay lines. If lines ended in a choice,
  // returns the created choice element.
  private static renderRoleplayLines(elem: any, lines: string[]): any {
    lines = this.collate(lines);
    for (let line of lines) {
      if (line.indexOf('* ') === 0) {
        var celem = cheerio.load('<choice>');
        var choice = celem('choice');
        choice.attr('text', line.substr(1).trim());
        elem.append(choice);
        return choice;
      } else {
        elem.append('<p>' + line + '</p>');
      }
    }
    // TODO: Deeper markdown rendering of lines.
    // '/(\*\*|__)(.*?)\1/' => '<strong>\2</strong>',            // bold
    // '/(\*|_)(.*?)\1/' => '<em>\2</em>',                       // emphasis
    return null;
  }
}