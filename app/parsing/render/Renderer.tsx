/// <reference path="../../../typings/custom/require.d.ts" />

import REGEX from '../../regex'

export type CombatChild = {text: string, visible?: string, event: any[], json?: any};
export type Instruction = {text: string, visible?: string};
export type RoleplayChild = {text: string, visible?: string, choice: any};

// These renderers
export interface Renderer {
 toRoleplay: (attribs: {[k: string]: any}, body: (string|RoleplayChild|Instruction)[], line: number) => any;
 toCombat: (attribs: {[k: string]: any}, events: CombatChild[], line: number) => any;
 toTrigger: (attribs: {[k: string]: any}, line: number) => any;
 toQuest: (attribs: {[k: string]: any}, line: number) => any;
 finalize: (quest: any, inner: any[]) => any;
}


// cleans up styles in the passed string, which is to say:
// turns all no-attribute <strong>, <b>, <em>, <i> and <del> into markdown versions (aka whitelist)
// removes all HTML tags
// turns markdown styles into HTML tags:
// * to <i>
// ** to <b>
// ~~ to <del>
export function sanitizeStyles(string: string): string {

  // replace whitelist w/ markdown
  string = string.replace(/<strong>(.*)<\/strong>/igm, '**$1**');
  string = string.replace(/<b>(.*)<\/b>/igm, '**$1**');
  string = string.replace(/<em>(.*)<\/em>/igm, '*$1*');
  string = string.replace(/<i>(.*)<\/i>/igm, '*$1*');
  string = string.replace(/<del>(.*)<\/del>/igm, '~~$1~~');

  // strip html tags and attributes (but leave contents)
  string = string.replace(REGEX.HTML_TAG, '');

  // replace markdown with HTML tags
  string = string.replace(/(\*\*)([^\*]*)(\*\*)/g, '<b>$2</b>');
  string = string.replace(/(\*)([^\*]*)(\*)/g, '<i>$2</i>');
  string = string.replace(/(~~)([^~]*)(~~)/g, '<del>$2</del>');

  return string;
}
