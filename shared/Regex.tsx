// !!!!!!!!!!!!!!! DO NOT USE /g ON REGEXES HERE !!!!!!!!!!!!!!!!!
// https://stackoverflow.com/questions/4688518/why-does-javascripts-regexp-maintain-state-between-calls
// Constructing a regex with the 'g' flag causes the expression to maintain state between calls.
// This can be a source of heisenbugs when calls to match(), exec(), and test() return false to indicate the
// end of processing a previous test.
// Avoid ending a regex with /g here and instead apply the global flag on a copy before matching, if needed.

// Takes in array of RegEx, returns a single regex that ORs them
export function combinedRegex(regexs: RegExp[], flags?: string): RegExp {
  const sources = regexs.map((regex) => { return regex.source});
  return new RegExp(sources.join('|'), flags);
}

export const REGEX = {
  // Breakdown:
  // <(\w|(\/\w))             Math "<" or "</" plus an immediate alphanumeric
  // (.|\n)*?>                Greedily match any character (incl newline) until closing ">"
  HTML_TAG: /<(\w|(\/\w))(.|\n)*?>/im,

  // Detects art with non-space characters on the same line
  INVALID_ART: /\s*[^\s]+\s*\[([a-zA-Z_0-9]*)\]/,

  // Contents inside of [], only allowing for alphanumerics + _'s
  ART: /\[([a-zA-Z_0-9]*)\]/,

  // Contents inside of ::, only allowing for alphanumeric + _'s
  ICON: /:([a-zA-Z_0-9]*):/,

  // For selecting ID references, example: (#idName)
  ID: /\(#[a-zA-Z0-9]+\)/,

  // Breakdown:
  // \*\s*                    Match ">" and any number of spaces (greedy)
  // ({{(.*?)}})?             Optionally match "{{some stuff}}" (lazy)
  // \s*                      Match any number of spaces (greedy)
  // (.*)$                    Match until the end of the string.
  INSTRUCTION: /^[>]\s*({{(.*?)}})?\s*(.*)$/,

  // For removing all not-word characters (aka anything except letters and ')
  NOT_WORD: /[^a-zA-Z']/,

  // match op elements (single + multiple lines)
  OP: /{{[^}]*}}/m,

  // Breakdown:
  // ^\s*\*\*\s*              Match "**" and any number of spaces (greedy)
  // ({{(.*?)}})?             Optionally match "{{some stuff}}" (lazy)
  // \s*                      Match any number of spaces (greedy)
  // (([a-z]+)|(goto [a-zA-Z0-9]+)) Match single alpha word or "goto <word>"
  // \*\*\s*$                 Match "**" + end of the string.
  TRIGGER: /^\s*\*\*\s*({{(.*?)}})?\s*(([a-z]+)|(goto [a-zA-Z0-9]+))\*\*\s*$/,

  // Detecting markdown styles
  BOLD_ASTERISKS: /\*\*([^\*]*)\*\*/,
  BOLD_UNDERSCORES: /\_\_([^\_]*)\_\_/,
  ITALIC_ASTERISKS: /\*([^\*]*)\*/,
  ITALIC_UNDERSCORES: /\_([^\_]*)\_/,
  STRIKETHROUGH: /~~([^~]*)~~/,
};
