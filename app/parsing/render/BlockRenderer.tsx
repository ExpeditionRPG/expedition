import {Normalize} from '../validation/Normalize'
import {Logger} from '../Logger'
import {Block} from '../block/BlockList'
import {Renderer, CombatChild, RoleplayChild} from './Renderer'

const REGEXP_BOLD = /\*\*(.*?)\*\*/;
const REGEXP_EVENT = /\* on (.*)/;

const ERR_PREFIX = "Internal XML Parse Error: ";

// Does not implement Renderer interface, rather wraps
// an existing Renderer's functions to accept a block list.
export class BlockRenderer {
  private renderer: Renderer;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  toRoleplay(blocks: Block[], log: Logger) {
    try {
      var extracted = this.extractCombatOrRoleplay(blocks[0].lines[0]);
    } catch (e) {
      console.log(e);
      log.err("could not parse block header", "404", blocks[0].startLine);
      extracted = {title: 'Roleplay', id: undefined, json: {}};
    }

    var attribs = extracted.json;
    attribs['title'] = attribs['title'] || extracted.title;
    attribs['id'] = attribs['id'] || extracted.id;

    // The only inner stuff
    var i = 0;
    var body: (string|RoleplayChild)[] = [];
    while (i < blocks.length) {
      var block = blocks[i];
      if (block.render) {
        // Only the blocks within choices should be rendered at this point.
        throw new Error(ERR_PREFIX + "found unexpected block with render");
      }

      // Append rendered stuff
      var lines = this.collate((i == 0) ? block.lines.slice(1) : block.lines);
      var choice: RoleplayChild;
      for (let line of lines) {
        if (line.indexOf('* ') === 0) {
          choice = Object.assign({}, this.extractChoiceOrEvent(line), {choice: []});
          // TODO: Assert end of lines.
        } else {
          body.push(line);
        }
      }

      if (choice) {
        // If we ended in a choice, continue through subsequent blocks until we end
        // up outside the choice block again.
        var inner = blocks[++i];
        while (i < blocks.length && inner.indent !== block.indent) {
          if (!inner.render) {
            throw new Error(ERR_PREFIX + "found unexpected block with no render");
          }
          choice.choice.push(inner.render);
          i++;
          inner = blocks[i];
        }
        body.push(choice);
      } else {
        i++;
      }
    }

    blocks[0].render = this.renderer.toRoleplay(attribs, body);
  };

  toQuest(block: Block, log: Logger) {
    block.render = this.renderer.toQuest(this.toMeta(block, log));
  }

  toTrigger(blocks: Block[], log: Logger) {
    var text = blocks[0].lines[0].match(REGEXP_BOLD);
    if (text) {
      blocks[0].render = this.renderer.toTrigger(text[1]);
    } else {
      log.err(
        'could not parse trigger value from trigger',
        '404',
        blocks[0].startLine
      );
    }

    if (blocks.length !== 1) {
      log.err(
        'trigger block group cannot contain multiple blocks',
        '404'
      );
    }
  }

  toCombat(blocks: Block[], log: Logger) {
    try {
      var extracted = this.extractCombatOrRoleplay(blocks[0].lines[0]);
    } catch (e) {
      console.log(e);
      log.err("could not parse block header", "404", blocks[0].startLine);
      extracted = {title: 'combat', id: undefined, json: {}};
    }

    var attribs = extracted.json;
    attribs['id'] = attribs['id'] || extracted.id;

    attribs['enemies'] = attribs['enemies'] || [];
    for (var i = 0; i < blocks[0].lines.length; i++) {
      var line = blocks[0].lines[i];
      if (line[0] === '-') {
        attribs['enemies'].push(line.substr(1).trim());
      }
    }

    if (attribs['enemies'].length === 0) {
      log.err(
        "combat block has no enemies listed",
        "404",
        blocks[0].startLine
      );
      attribs['enemies'] = ["UNKNOWN"];
    }


    var i = 0;
    var events: CombatChild[] = [];
    var currEvent: CombatChild = null;
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      if (block.render) {
        if (!currEvent) {
          log.err(
            "found inner block of combat block without an event bullet",
            "404",
            block.startLine
          );
          continue;
        }
        currEvent.event.push(block.render);
        continue;
      }

      // Skip the first line if we're at the root block (already parsed)
      for (var j = (i==0) ? 1 : 0; j < block.lines.length; j++) {
        var line = block.lines[j];
        // Skip empty lines and enemy list
        if (line === '' || line[0] === '-') {
          continue;
        }

        // We should only ever see event blocks within the combat block.
        // These blocks are only single lines.
        var extractedEvent = Object.assign({}, this.extractChoiceOrEvent(line), {event: []});
        if (!extractedEvent.text) {
          log.err(
            "lines within combat block must be event bullets or enemies; instead found \""+line+"\"",
            "404",
            block.startLine + j
          );
          continue;
        }
        if (currEvent) {
          events.push(currEvent);
        }
        currEvent = extractedEvent;
      }
    }

    if (currEvent) {
      events.push(currEvent);
    }

    var hasWin = false;
    var hasLose = false;

    for (var i = 0; i < events.length; i++) {
      hasWin = hasWin || (events[i].text == "on win");
      hasLose = hasLose || (events[i].text == "on lose");
    }
    if (!hasWin) {
      log.err(
        "combat block must have 'win' event",
        "404"
      );
      events.push({text: "on win", event: [this.renderer.toTrigger("end")]});
    }
    if (!hasWin) {
      log.err(
        "combat block must have 'lose' event",
        "404"
      );
      events.push({text: "on lose", event: [this.renderer.toTrigger("end")]});
    }

    blocks[0].render = this.renderer.toCombat(attribs, events);
  }

  toMeta(block: Block, log: Logger): {[k: string]: any} {
    // Parse meta using the block itself.
    // Metadata format is standard across all renderers.
    if (!block) {
      if (log) log.err('Missing quest root block', '404');
      return {'title': 'UNKNOWN'};
    }

    var attrs: {[k: string]: string} = {title: block.lines[0].substr(1)};
    for(var i = 1; i < block.lines.length && block.lines[i] !== ''; i++) {
      var kv = block.lines[i].split(":");
      if (kv.length !== 2) {
        if (log) log.err('invalid quest attribute string "' + block.lines[i] + '"',
          '404', block.startLine + i);
        continue;
      }
      var k = kv[0].toLowerCase();
      var v = kv[1].trim();
      attrs[k] = v;
    }
    return Normalize.questAttrs(attrs, log);
  }

  finalize(zeroIndentBlockGroupRoots: Block[], log: Logger): any {
    var toRender: any[] = [];

    var quest: any = null;
    if (zeroIndentBlockGroupRoots && zeroIndentBlockGroupRoots.length > 0) {
      var questBlock = zeroIndentBlockGroupRoots[0];
      if (questBlock.lines.length && questBlock.lines[0].length && questBlock.lines[0][0] === '#') {
        quest = questBlock.render;
      } else {
        // Error here. We can still handle null quests in the renderer.
        log.err("root block must be a quest header", "404", 0);
        quest = this.renderer.toQuest({title: 'Error'});
      }
    } else {
      log.err("No quest blocks found", "404");
      quest = this.renderer.toQuest({title: 'Error'});
    }

    for (var i = 1; i < zeroIndentBlockGroupRoots.length; i++) {
      toRender.push(zeroIndentBlockGroupRoots[i].render);
    }



    if (toRender.length === 0) {
      toRender.push(this.renderer.toRoleplay({}, []));
    }

    return this.renderer.finalize(quest, toRender);
  }

  private extractCombatOrRoleplay(line: string): {title: string, id: string, json: {[k: string]: any}} {
    // Breakdown:
    // ^_(.*?)_                 Match italicized text at start of string
    //
    // [^{\(]*                  Greedy match all characters until "{" or "("
    //
    // (\(#([a-zA-Z0-9]*?)\))?  Optionally match "(#alphanum3ric)",
    //                          once for outer and once for "alphanum3ric"
    //
    // [^{\(]*                  Greedy match all characters until "{" or "("
    //
    // (\{.*\})?                Optionally match a JSON blob, greedily.
    var m = line.match(/^_(.*?)_[^{\(]*(\(#([a-zA-Z0-9]*?)\))?[^{\(]*(\{.*\})?/);
    return {
      title: m[1],
      id: m[3],
      json: (m[4]) ? JSON.parse(m[4]) : {}
    };
  }

  private extractChoiceOrEvent(line: string): {text: string, visible: string} {
    // Breakdown:
    // \*\s*                    Match "*" and any number of spaces (greedy)
    // (\{\{(.*?)\}\})?         Optionally match "{{some stuff}}"
    // \s*                      Match any number of spaces (greedy)
    // (.*)$                    Match until the end of the string.
    var m = line.match(/^\*\s*(\{\{(.*?)\}\})?\s*(.*)$/);
    return {
      visible: m[2],
      text: m[3],
    };
  }

  private collate(lines: string[]): string[] {
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
}