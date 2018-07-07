import {REGEX} from '../../Regex';
import {Block} from '../block/BlockList';
import {Logger} from '../Logger';
import Normalize from '../validation/Normalize';
import {Instruction, Renderer} from './Renderer';
import {TemplateType, sanitizeTemplate, getTemplateType, TEMPLATE_ATTRIBUTE_MAP, TEMPLATE_TYPES, TemplateChild} from './Template';

// Does not implement Renderer interface, rather wraps
// an existing Renderer's functions to accept a block list.
export class BlockRenderer {
  private renderer: Renderer;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  public toNode(blocks: Block[], log: Logger) {
    // There are cases where we don't have a roleplay header, e.g.
    // the first roleplay block inside a choice. This is fine,
    // and not an error, so we don't pass a logger here.
    let extracted = this.extractTemplate(blocks[0].lines[0], undefined);
    const hasHeader = Boolean(extracted);

    let templateType: TemplateType = TEMPLATE_TYPES[0];
    if (hasHeader && extracted && typeof(extracted.title) === 'string') {
      templateType = getTemplateType(extracted.title) || TEMPLATE_TYPES[0];
    }
    extracted = extracted || {title: '', id: undefined, json: {}};

    const attribs = extracted.json;
    attribs.id = attribs.id || extracted.id;
    if (extracted.title !== templateType) {
      attribs.title = attribs.title || extracted.title;
      // don't count length of icon names, just that they take up ~1 character
      if (attribs.title.replace(/:.*?:/g, '#').length >= 25) {
        log.err('card title too long', '433');
      }
    }
    const attrName = TEMPLATE_ATTRIBUTE_MAP[templateType];
    if (attrName !== null) {
      attribs[attrName] = attribs[attrName] || [];
    }

    // Every node can contain:
    // - one or more text paragraphs
    // - choices/events leading to subnodes
    // - a list of parameters for template-specific behavior
    //
    // We initially parse these without concern for which are valid;
    // The correctness of these values is determined by the validation step at the end.
    const body: Array<string|TemplateChild|Instruction> = [];

    let i = 0;
    while (i < blocks.length) {
      const block = blocks[i];
      if (block.render) {
        // Only the blocks within events should be rendered at this point.
        log.err(
          templateType + ' cannot contain indented sections that are not choices/events',
          '411',
          blocks[0].startLine
        );
      }

      // Append rendered stuff
      const lines = this.collate((i === 0 && hasHeader) ? block.lines.slice(1) : block.lines);
      let child: TemplateChild | null = null;
      let instruction: Instruction;
      let lineIdx = 0;
      for (const line of lines) {
        lineIdx++;

        if (line.startsWith('* ')) {
          const bullet = this.extractBulleted(line, block.startLine + lineIdx, log);
          child = (bullet) ? Object.assign({}, bullet, {outcome: []}) : null;
          // TODO: Assert end of lines.
        } else if (line.startsWith('- ') && attrName !== null) {
          // Params are parsed un-collated as multiple params can be directly next to each
          // other without intermediate whitespace.
          const unCollated = (i === 0 && hasHeader) ? block.lines.slice(1) : block.lines;
          let j = 0;
          while (unCollated[j] === '') {
            j++;
          }
          for (; j < unCollated.length; j++) {
            const l = unCollated[j];
            if (l === '') {
              break;
            }
            if (!l.startsWith('- ')) {
              log.err('need whitespace between list and next section', '420', lineIdx + j);
              break;
            }
            const bullet = this.extractBulleted(l, blocks[0].startLine + i, log);
            if (!bullet) {
              continue;
            }
            let b = bullet;
            if (!bullet.text) {
              // Visible is actually a value expression
              b = {
                json: bullet.json,
                text: '{{' + bullet.visible + '}}',
              };
            }
            attribs[attrName].push(b);
          }
        } else if (line.startsWith('> ')) {
          instruction = this.extractInstruction(line);
          body.push(instruction);
        } else {
          body.push(line);
        }
      }

      if (child) {
        // If we ended in a child, continue through subsequent blocks until we end
        // up outside the child again.
        let inner = blocks[++i];
        while (i < blocks.length && inner.indent !== block.indent) {
          if (!inner.render) {
            log.internal('found unexpected block with no render', '501', blocks[0].startLine);
            i++;
            continue;
          }
          child.outcome.push(inner.render);
          i++;
          inner = blocks[i];
        }
        if (child.text.trim() === '') {
          log.err(
            'choice/event missing title',
            '428',
            blocks[i - 1].startLine - 2
          );
        }
        body.push(child);
      } else {
        i++;
      }
    }

    const sanitized = sanitizeTemplate(templateType, attribs, body, blocks[0].startLine, () => this.renderer.toTrigger({text: 'end'}, -1), log);
    blocks[0].render = this.renderer.toTemplate(templateType, sanitized.attribs, sanitized.body, blocks[0].startLine);
  }

  public toQuest(block: Block, log: Logger) {
    block.render = this.renderer.toQuest(this.toMeta(block, log), block.startLine);
  }

  public toTrigger(blocks: Block[], log: Logger) {
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

  public validate(): any {
    // TODO:
    // - Ensure there's at least one node that isn't the quest
    // - Ensure all paths end with an "end" trigger
    // - Ensure all template attributes are valid (use whitelist)
    // - Validate roleplay attributes (w/ whitelist)
    // - Validate choice attributes (w/ whitelist)
    return [];
  }

  public toMeta(block: Block, log?: Logger): {[k: string]: any} {
    // Parse meta using the block itself.
    // Metadata format is standard across all renderers.
    if (!block) {
      return {title: 'UNKNOWN'};
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
          log.err('Quest attributes have migrated to the "Publish" button - simply delete this line.',
            '429',
            block.startLine + i);
        }
      }
    }

    return Normalize.questAttrs(attrs, log);
  }

  public finalize(zeroIndentBlockGroupRoots: Block[], log: Logger): any {
    const toRender: any[] = [];

    let quest: any = null;
    if (zeroIndentBlockGroupRoots && zeroIndentBlockGroupRoots.length > 0) {
      const questBlock = zeroIndentBlockGroupRoots[0];
      if (questBlock.lines.length && questBlock.lines[0].length && questBlock.lines[0][0] === '#') {
        quest = questBlock.render;
      } else {
        // Error here. We can still handle null quests in the renderer.
        log.err('root card must be a quest header', '421', 0);
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
      // TODO: Remove reference to event type
      toRender.push(this.renderer.toTemplate(TEMPLATE_TYPES[0], {}, [], -1));
    }

    return this.renderer.finalize(quest, toRender);
  }

  private extractTemplate(line: string, log?: Logger):
    {title: string, id?: string, json: {[k: string]: any}} | null {
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
        id: m[3],
        json: (m[4]) ? JSON.parse(m[4]) : {},
        title: m[1],
      };
    } catch (e) {
      if (log) {
        log.err('could not parse card header', '413');
      }
      return null;
    }
  }

  private extractBulleted(line: string, idx: number, log: Logger):
    {text: string, visible?: string, json: {[k: string]: any}} | null {
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
        json: (m[4]) ? JSON.parse(m[4]) : {},
        text: (m[3]) ? m[3].trim() : '',
        visible: m[2] || undefined,
      };
    } catch (e) {
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
        text: '',
        visible: 'false',
      };
    }
    return {
      text: m[3] || '',
      visible: m[2],
    };
  }

  private extractTrigger(line: string): {text: string|null, visible: string|null} {
    const m = line.match(REGEX.TRIGGER);
    if (!m) {
      return {
        text: '',
        visible: 'false',
      };
    }
    return {
      text: m[3],
      visible: m[2],
    };
  }

  private collate(lines: string[]): string[] {
    const result: string[] = [''];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === '') {
        continue;
      }
      if (lines[i - 1] === '' && result[result.length - 1] !== '') {
        result.push('');
      }
      result[result.length - 1] += (result[result.length - 1] !== '') ? ' ' + lines[i] : lines[i];
    }
    return result;
  }
}
