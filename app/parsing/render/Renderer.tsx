/// <reference path="../../../typings/custom/require.d.ts" />

export type CombatChild = {text: string, visible?: string, event: any[]};
export type Instruction = {text: string, visible?: string};
export type RoleplayChild = {text: string, visible?: string, choice: any};

// These renderers
export interface Renderer {
 toRoleplay: (attribs: {[k: string]: any}, body: (string|RoleplayChild|Instruction)[]) => any;
 toCombat: (attribs: {[k: string]: any}, events: CombatChild[]) => any;
 toTrigger: (attribs: {[k: string]: any}) => any;
 toQuest: (attribs: {[k: string]: any}) => any;
 finalize: (quest: any, inner: any[]) => any;
}


// cleans up styles in the passed string, which is to say:
// turns all no-attribute <strong>, <em> and <del> into markdown versions (aka whitelist)
// removes all HTML tags
// turns markdown styles into HTML tags:
// * to <em>
// ** to <strong>
// ~~ to <del>
export function sanitizeStyles(string: string): string {

  // replace whitelist w/ markdown
  string = string.replace(/<strong>(.*)<\/strong>/igm, '**$1**');
  string = string.replace(/<em>(.*)<\/em>/igm, '*$1*');
  string = string.replace(/<del>(.*)<\/del>/igm, '~~$1~~');

  // strip html
  string = string.replace(/<(?:.|\n)*?>/igm, '');

  // replace markdown with HTML tags
  string = string.replace(/(\*\*)([^\*]*)(\*\*)/g, '<strong>$2</strong>');
  string = string.replace(/(\*)([^\*]*)(\*)/g, '<em>$2</em>');
  string = string.replace(/(~~)([^~]*)(~~)/g, '<del>$2</del>');

  return string;
}
