import {Renderer, CombatChild, Instruction, RoleplayChild} from './Renderer'
import {Block} from '../block/BlockList'
import {Logger} from '../Logger'
import {Normalize} from '../validation/Normalize'
import REGEX from '../../Regex'

function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// Does not implement Renderer interface, rather wraps
// an existing Renderer's functions to accept a block list.
export class BlockRenderer {
  private renderer: Renderer;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  toRoleplay(blocks: Block[], log: Logger) {
    // There are cases where we don't have a roleplay header, e.g.
    // the first roleplay block inside a choice. This is fine,
    // and not an error, so we don't pass a logger here.
    let extracted = this.extractCombatOrRoleplay(blocks[0].lines[0], undefined);
    const hasHeader = Boolean(extracted);
    extracted = extracted || {title: '', id: undefined, json: {}};

    const attribs = extracted.json;
    attribs['title'] = attribs['title'] || extracted.title;
    attribs['id'] = attribs['id'] || extracted.id;

    // don't count length of icon names, just that they take up ~1 character
    if (attribs.title.replace(/:.*?:/g, '#').length >= 25) {
      log.err('card title too long', '433');
    }

    // The only inner stuff
    let i = 0;
    const body: (string|RoleplayChild|Instruction)[] = [];
    while (i < blocks.length) {
      const block = blocks[i];
      if (block.render) {
        // Only the blocks within choices should be rendered at this point.
        log.err(
          'roleplay blocks cannot contain indented sections that are not choices',
          '411',
          blocks[0].startLine
        );
      }

      // Append rendered stuff
      const lines = this.collate((i === 0 && hasHeader) ? block.lines.slice(1) : block.lines);
      let choice: RoleplayChild | null = null;
      let instruction: Instruction;
      let lineIdx = 0;
      for (const line of lines) {
        lineIdx++;
        const invalidArt = REGEX.INVALID_ART.exec(line);
        if (invalidArt) {
          log.err(
            `[${invalidArt[1]}] should be on its own line`,
            '435',
            block.startLine
          );
        }

        if (line.indexOf('* ') === 0) {
          const bullet = this.extractBulleted(line, block.startLine + lineIdx, log);
          choice = (bullet) ? Object.assign({}, bullet, {choice: []}) : null;
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
        let inner = blocks[++i];
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

    let extracted: any;
    try {
      extracted = this.extractTrigger(blocks[0].lines[0]);
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

    const extracted = this.extractCombatOrRoleplay(blocks[0].lines[0], log) || {title: 'combat', id: undefined, json: {}};

    const attribs = extracted.json;
    attribs['id'] = attribs['id'] || extracted.id;

    attribs['enemies'] = attribs['enemies'] || [];
    for (let i = 0; i < blocks[0].lines.length; i++) {
      const line = blocks[0].lines[i];
      if (line[0] === '-') {
        const extractedBullet = this.extractBulleted(line, blocks[0].startLine + i, log);
        if (!extractedBullet) {
          continue;
        }
        let enemy = extractedBullet;
        if (!extractedBullet.text) {
          // Visible is actually a value expression
          enemy = {
            text: '{{' + extractedBullet.visible + '}}',
            json: extractedBullet.json
          };
        }

        // Validate tier if set
        if (enemy.json && enemy.json.tier) {
          const tier = enemy.json.tier;
          if (!isNumeric(tier) || tier < 1) {
            log.err('tier must be a positive number', '418', blocks[0].startLine + i);
            continue;
          }
        }
        attribs['enemies'].push(enemy);
      }
    }

    if (attribs['enemies'].length === 0) {
      log.err('combat card has no enemies listed', '414');
      attribs['enemies'] = [{text: 'UNKNOWN'}];
    }


    const events: CombatChild[] = [];
    let currEvent: CombatChild | null = null;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
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
        const line = block.lines[j];
        // Skip empty lines, enemy list
        if (line === '' || line[0] === '-') {
          continue;
        }

        // We should only ever see event blocks within the combat block.
        // These blocks are only single lines.
        const evt = this.extractBulleted(line, block.startLine + j, log);
        const extractedEvent = (evt) ? Object.assign({}, evt, {event: []}) : null;
        if (!extractedEvent || !extractedEvent.text) {
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

    let hasWin = false;
    let hasLose = false;

    for (let i = 0; i < events.length; i++) {
      hasWin = hasWin || (events[i].text === 'on win');
      hasLose = hasLose || (events[i].text === 'on lose');
    }
    if (!hasWin) {
      log.err('combat card must have "on win" event', '417');
      events.push({text: 'on win', event: [this.renderer.toTrigger({text: 'end'}, -1)]});
    }
    if (!hasLose) {
      log.err('combat card must have "on lose" event', '417');
      events.push({text: 'on lose', event: [this.renderer.toTrigger({text: 'end'}, -1)]});
    }

    blocks[0].render = this.renderer.toCombat(attribs, events, blocks[0].startLine);
  }

  toMeta(block: Block, log?: Logger): {[k: string]: any} {
    // Parse meta using the block itself.
    // Metadata format is standard across all renderers.
    if (!block) {
      return {'title': 'UNKNOWN'};
    }

    const attrs: {[k: string]: string} = {title: block.lines[0].substr(1).trim()};
    for (let i = 1; i < block.lines.length && block.lines[i] !== ''; i++) {
      const kv = block.lines[i].split(':');
      if (kv.length !== 2) {
        if (log) {
          log.err('invalid quest attribute line "' + block.lines[i] + '"', '420', block.startLine + i);
        }
        continue;
      }
      const k = kv[0].toLowerCase();
      const v = kv[1].trim();
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
    const toRender: any[] = [];

    let quest: any = null;
    if (zeroIndentBlockGroupRoots && zeroIndentBlockGroupRoots.length > 0) {
      const questBlock = zeroIndentBlockGroupRoots[0];
      if (questBlock.lines.length && questBlock.lines[0].length && questBlock.lines[0][0] === '#') {
        quest = questBlock.render;
      } else {
        // Error here. We can still handle null quests in the renderer.
        log.err('root block must be a quest header', '421', 0);
        quest = this.renderer.toQuest({title: 'Error'}, -1);
      }
    } else {
      log.err('no quest blocks found', '422');
      quest = this.renderer.toQuest({title: 'Error'}, -1);
    }

    for (let i = 1; i < zeroIndentBlockGroupRoots.length; i++) {
      const block = zeroIndentBlockGroupRoots[i];
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
      toRender.push(this.renderer.toRoleplay({}, [], -1));
    }

    return this.renderer.finalize(quest, toRender);
  }

  private extractCombatOrRoleplay(line: string, log?: Logger): {title: string, id?: string, json: {[k: string]: any}} | null {
    // Breakdown:
    // ^_(.*)_                  Match italicized text at start of string until there's a break
    //                          which may contain multiple :icon_names: (hence the greedy selection)
    //
    // [^{\(]*                  Greedy match all characters until "{" or "("
    //
    // (\(#([a-zA-Z0-9]*?)\))?  Optionally match "(#alphanum3ric)",
    //                          once for outer and once for "alphanum3ric"
    //
    // [^{\(]*                  Match all characters until "{" or "(" (greedy)
    //
    // (\{.*\})?                Optionally match a JSON blob (greedy)
    try {
      const m = line.match(/^_(.*)_[^{\(]*(\(#([a-zA-Z0-9]*?)\))?[^{\(]*(\{.*\})?/);
      if (!m || !m[1]) {
        throw new Error('Missing title');
      }
      return {
        title: m[1],
        id: m[3],
        json: (m[4]) ? JSON.parse(m[4]) : {},
      };
    } catch(e) {
      if (log) {
        log.err('could not parse block header', '413');
      }
      return null;
    }
  }

  private extractBulleted(line: string, idx: number, log: Logger): {text: string, visible?: string, json: {[k: string]: any}} | null {
    // Breakdown:
    // \*\s*                    Match "*" or "-" and any number of spaces (greedy)
    // (\{\{(.*?)\}\})?         Optionally match "{{some stuff}}"
    // \s*                      Match any number of spaces (greedy)
    // ((?:                     Capture an unlimited number of:
    //  [^{]|                   Text except {'s
    //  (?:{{[^}]*}})*)         Ops inside of {{}}'s
    // *)*)
    // (\{.*\})?                Optionally match a final JSON blob (greedy)
    // $                        End of string
    try {
      const m = line.match(/^[\*-]\s*(\{\{(.*?)\}\})?\s*((?:[^{]|(?:{{[^}]*}})*)*)(\{.*\})?$/);
      if (!m) {
        throw new Error('Match failed');
      }
      return {
        visible: m[2] || undefined,
        text: (m[3]) ? m[3].trim() : '',
        json: (m[4]) ? JSON.parse(m[4]) : {},
      };
    } catch(e) {
      if (log) {
        log.err('failed to parse bulleted line (check your JSON)', '412', idx);
      }
      return null;
    }
  }

  private extractInstruction(line: string): Instruction {
    const m = line.match(REGEX.INSTRUCTION);
    if (!m) {
      return {
        visible: 'false',
        text: '',
      };
    }
    return {
      visible: m[2],
      text: m[3] || '',
    };
  }

  private extractTrigger(line: string): {text: string|null, visible: string|null} {
    const m = line.match(REGEX.TRIGGER);
    if (!m) {
      return {
        visible: 'false',
        text: '',
      };
    }
    return {
      visible: m[2],
      text: m[3],
    };
  }

  private collate(lines: string[]): string[] {
    const result: string[] = [''];
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
