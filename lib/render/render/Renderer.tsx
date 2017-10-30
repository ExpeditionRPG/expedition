import REGEX from '../../Regex'

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
// * and _ to <i>
// ** and __ to <b>
// ~~ to <del>
export function sanitizeStyles(string: string): string {

  // First, store and remove the contents of {{ops}} so they don't interfere with styling
  // non-greedily capture, e.g. {{ var = {a: {b: "5}}"}} }}
  // ({{               Capture everything inside of {{}}
  //  (?:              Including 0+ of the following possibilities:
  //    [^}{"]+        All non-breaking characters
  //    |(?:"[^"]*?")  Anything (including brackets) in quotes (skipping cases like var = "a}}")
  //    |{             Any pairs of brackets; skipping over quotes inside of them (like {a: "}}"})
  //      (?:[^}{]+|{[^}{]*?|"[^"]*?"})*?
  //    }
  //  )*?
  // }})
  const ops: string[] = [];
  const opsRegex = /({{(?:[^}{"]+|(?:"[^"]*?")|{(?:[^}{]+|{[^}{]*?|"[^"]*?"})*?})*?}})/g;
  let matches = opsRegex.exec(string);
  while (matches) {
    ops.push(matches[1]);
    matches = opsRegex.exec(string);
  }
  string = string.replace(opsRegex, '{{}}');

  // Same thing, now with [art] and :icons:
  const art: string[] = [];
  matches = REGEX.ART_OR_ICON.exec(string);
  while (matches) {
    art.push(matches[1]);
    matches = REGEX.ART_OR_ICON.exec(string);
  }
  string = string.replace(REGEX.ART_OR_ICON, '[art]');

  // replace whitelist w/ markdown
  string = string.replace(/<strong>(.*?)<\/strong>/igm, '**$1**');
  string = string.replace(/<b>(.*?)<\/b>/igm, '**$1**');
  string = string.replace(/<em>(.*?)<\/em>/igm, '*$1*');
  string = string.replace(/<i>(.*?)<\/i>/igm, '*$1*');
  string = string.replace(/<del>(.*?)<\/del>/igm, '~~$1~~');

  // strip html tags and attributes (but leave contents)
  string = string.replace(REGEX.HTML_TAG, '');

  // replace markdown with HTML tags
  // general case: replace anything surrounded by markdown styles with their matching HTML tag:
  // \*\*([^\*]*)\*\*       non-greedily match the contents between two sets of **
  string = string.replace(REGEX.BOLD_ASTERISKS, '<b>$1</b>');
  string = string.replace(REGEX.BOLD_UNDERSCORES, '<b>$1</b>');
  string = string.replace(REGEX.ITALIC_ASTERISKS, '<i>$1</i>');
  string = string.replace(REGEX.ITALIC_UNDERSCORES, '<i>$1</i>');
  string = string.replace(REGEX.STRIKETHROUGH, '<del>$1</del>');

  // Insert stored ops contents back into ops
  string = string.replace(/{{}}/g, () => ops.shift());
  string = string.replace(/\[art\]/g, () => art.shift());

  return string;
}
