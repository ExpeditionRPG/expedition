import {Renderer, CombatChild, Instruction, RoleplayChild} from './Renderer'
import {Block} from '../block/BlockList'
import {Logger} from '../Logger'
import {Normalize} from '../validation/Normalize'
import REGEX from '../../regex'


// Does not implement Renderer interface, rather wraps
// an existing Renderer's functions to accept a block list.
export class BlockRenderer {
  private renderer: Renderer;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  toRoleplay(blocks: Block[], log: Logger) {
    var hasHeader = false;
    try {
      var extracted = this.extractCombatOrRoleplay(blocks[0].lines[0]);
      hasHeader = true;
    } catch (e) {
      // There are cases where we don't have a roleplay header, e.g.
      // the first roleplay block inside a choice. This is fine,
      // and not an error.
      extracted = {title: '', id: undefined, json: {}};
    }

    var attribs = extracted.json;
    attribs['title'] = attribs['title'] || extracted.title;
    attribs['id'] = attribs['id'] || extracted.id;

    // The only inner stuff
    var i = 0;
    var body: (string|RoleplayChild|Instruction)[] = [];
    while (i < blocks.length) {
      var block = blocks[i];
      if (block.render) {
        // Only the blocks within choices should be rendered at this point.
        log.err(
          'roleplay blocks cannot contain indented sections that are not choices',
          '411',
          blocks[0].startLine
        );
      }

      // Append rendered stuff
      var lines = this.collate((i === 0 && hasHeader) ? block.lines.slice(1) : block.lines);
      var choice: RoleplayChild;
      var instruction: Instruction;
      for (let line of lines) {
        if (line.indexOf('* ') === 0) {
          choice = Object.assign({}, this.extractBulleted(line), {choice: []});
          // TODO: Assert end of lines.
        } else if (line.indexOf('> ') === 0) {
          instruction = this.extractInstruction(line);
          body.push(instruction);
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
            log.internal('found unexpected block with no render', '501', blocks[0].startLine);
            i++;
            continue;
          }
          choice.choice.push(inner.render);
          i++;
          inner = blocks[i];
        }
        if (choice.text.trim() === '') {
          console.log('HERP');
          log.err(
            'choice missing title',
            '428',
            blocks[i-1].startLine-2
          );
        }
        body.push(choice);
      } else {
        i++;
      }
    }

    blocks[0].render = this.renderer.toRoleplay(attribs, body, blocks[0].startLine);
  };

  toQuest(block: Block, log: Logger) {
    block.render = this.renderer.toQuest(this.toMeta(block, log), block.startLine);
  }

  toTrigger(blocks: Block[], log: Logger) {
    if (blocks.length !== 1) {
      log.internal('trigger found with multiple blocks', '502');
    }

    try {
      var extracted: any = this.extractTrigger(blocks[0].lines[0]);
    } catch (e) {
      log.err('could not parse trigger', '410');
      extracted = {title: 'end', visible: undefined};
    }

    blocks[0].render = this.renderer.toTrigger(extracted, blocks[0].startLine);
  }

  validate(): any {
    // TODO:
    // - Ensure there's at least one node that isn't the quest
    // - Ensure all paths end with an "end" trigger
    // - Ensure all combat enemies are valid (use whitelist)
    // - Validate roleplay attributes (w/ whitelist)
    // - Validate choice attributes (w/ whitelist)
    return [];
  }

  toCombat(blocks: Block[], log: Logger) {
    if (!blocks.length) {
      log.err(
        'empty combat list',
        '412',
        blocks[0].startLine
      );
    }

    try {
      var extracted = this.extractCombatOrRoleplay(blocks[0].lines[0]);
    } catch (e) {
      log.err('could not parse block header', '413');
      extracted = {title: 'combat', id: undefined, json: {}};
    }

    var attribs = extracted.json;
    attribs['id'] = attribs['id'] || extracted.id;

    attribs['enemies'] = attribs['enemies'] || [];
    for (let i = 0; i < blocks[0].lines.length; i++) {
      let line = blocks[0].lines[i];
      if (line[0] === '-') {
        let extractedBullet = this.extractBulleted(line);
        if (!extractedBullet.text) {
          // Visible is actually a value expression
          attribs['enemies'].push({text: '{{' + extractedBullet.visible + '}}'});
        } else {
          attribs['enemies'].push(extractedBullet);
        }
      }
    }

    if (attribs['enemies'].length === 0) {
      log.err('combat card has no enemies listed', '414');
      attribs['enemies'] = [{text: 'UNKNOWN'}];
    }


    var events: CombatChild[] = [];
    var currEvent: CombatChild = null;
    for (let i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      if (block.render) {
        if (!currEvent) {
          log.err(
            'found inner block of combat block without an event bullet',
            '415',
            block.startLine
          );
          continue;
        }
        currEvent.event.push(block.render);
        continue;
      }

      // Skip the first line if we're at the root block (already parsed)
      for (let j = (i===0) ? 1 : 0; j < block.lines.length; j++) {
        let line = block.lines[j];
        // Skip empty lines, enemy list
        if (line === '' || line[0] === '-') {
          continue;
        }

        // We should only ever see event blocks within the combat block.
        // These blocks are only single lines.
        var extractedEvent = Object.assign({}, this.extractBulleted(line), {event: []});
        if (!Boolean(extractedEvent) || !extractedEvent.text) {
          log.err(
            'lines within combat block must be events or enemies, not freestanding text',
            '416',
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

    for (let i = 0; i < events.length; i++) {
      hasWin = hasWin || (events[i].text === 'on win');
      hasLose = hasLose || (events[i].text === 'on lose');
    }
    if (!hasWin) {
      log.err('combat card must have "on win" event', '417');
      events.push({text: 'on win', event: [this.renderer.toTrigger({text: 'end'}, null)]});
    }
    if (!hasLose) {
      log.err('combat card must have "on lose" event', '417');
      events.push({text: 'on lose', event: [this.renderer.toTrigger({text: 'end'}, null)]});
    }

    blocks[0].render = this.renderer.toCombat(attribs, events, blocks[0].startLine);
  }

  toMeta(block: Block, log: Logger): {[k: string]: any} {
    // Parse meta using the block itself.
    // Metadata format is standard across all renderers.
    if (!block) {
      return {'title': 'UNKNOWN'};
    }

    var attrs: {[k: string]: string} = {title: block.lines[0].substr(1).trim()};
    for (let i = 1; i < block.lines.length && block.lines[i] !== ''; i++) {
      let kv = block.lines[i].split(':');
      if (kv.length !== 2) {
        if (log) {
          log.err('invalid quest attribute line "' + block.lines[i] + '"', '420', block.startLine + i);
        }
        continue;
      }
      let k = kv[0].toLowerCase();
      let v = kv[1].trim();
      attrs[k] = v;

      if (k !== 'title') {
        if (log) {
          log.err('Quest attributes have migrated to the "Publish" button - simply delete this line.', '429', block.startLine + i);
        }
      }
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
        log.err('root block must be a quest header', '421', 0);
        quest = this.renderer.toQuest({title: 'Error'}, null);
      }
    } else {
      log.err('no quest blocks found', '422');
      quest = this.renderer.toQuest({title: 'Error'}, null);
    }

    for (var i = 1; i < zeroIndentBlockGroupRoots.length; i++) {
      var block = zeroIndentBlockGroupRoots[i];
      if (!block) {
        log.internal('empty block found in finalize step', '503');
        continue;
      }
      if (!block.render) {
        log.internal('Unrendered block found in finalize step', '504');
        continue;
      }

      toRender.push(zeroIndentBlockGroupRoots[i].render);
    }



    if (toRender.length === 0) {
      toRender.push(this.renderer.toRoleplay({}, [], null));
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
    // [^{\(]*                  Match all characters until "{" or "(" (greedy)
    //
    // (\{.*\})?                Optionally match a JSON blob (greedy)
    const m = line.match(/^_(.*?)_[^{\(]*(\(#([a-zA-Z0-9]*?)\))?[^{\(]*(\{.*\})?/);
    return {
      title: m[1],
      id: m[3],
      json: (m[4]) ? JSON.parse(m[4]) : {},
    };
  }

  private extractBulleted(line: string): {text: string, visible: string, json: {[k: string]: any}} {
    // Breakdown:
    // \*\s*                    Match "*" or "-" and any number of spaces (greedy)
    // (\{\{(.*?)\}\})?         Optionally match "{{some stuff}}"
    // \s*                      Match any number of spaces (greedy)
    // ([^{]*)                  Match all characters until "{" (greedy)
    // (\{.*\})?                Optionally match a JSON blob (greedy)
    // $                        End of string
    const m = line.match(/^[\*-]\s*(\{\{(.*?)\}\})?\s*([^{]*)(\{.*\})?$/);
    if (m === null) {
      return {
        visible: 'false',
        text: '',
        json: {},
      };
    }
    return {
      visible: m[2],
      text: m[3].trim(),
      json: (m[4]) ? JSON.parse(m[4]) : {},
    };
  }

  private extractInstruction(line: string): {text: string, visible: string} {
    const m = line.match(REGEX.INSTRUCTION);
    return {
      visible: m[2],
      text: m[3],
    };
  }

  private extractTrigger(line: string): {text: string, visible: string} {
    const m = line.match(REGEX.TRIGGER);
    return {
      visible: m[2],
      text: m[3],
    };
  }

  private collate(lines: string[]): string[] {
    var result: string[] = [''];
    for (let i = 0; i < lines.length; i++) {
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
