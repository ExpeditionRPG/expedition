export default {
  // Extracts the string between the first / and last / in a regex
  EXTRACT_REGEX: /^\/(.*)\/[igmxs]*$/,

  // Breakdown:
  // <(\w|(\/\w))             Math "<" or "</" plus an immediate alphanumeric
  // (.|\n)*?>                Greedily match any character (incl newline) until closing ">"
  HTML_TAG: /<(\w|(\/\w))(.|\n)*?>/igm,

  // Detects icons in []'s (old syntax)
  INVALID_ART: /.+\[([a-z_0-9]*)\].+/ig,

  // [art] or :icon: - captures the entire thing
  ART_OR_ICON: /([\[:][a-z_0-9]*[\]:])/ig,

  // For selecting ID references, example: (#idName)
  ID: /\(#[a-zA-Z]*\)/g,

  // Breakdown:
  // \*\s*                    Match ">" and any number of spaces (greedy)
  // ({{(.*?)}})?             Optionally match "{{some stuff}}" (lazy)
  // \s*                      Match any number of spaces (greedy)
  // (.*)$                    Match until the end of the string.
  INSTRUCTION: /^[>]\s*({{(.*?)}})?\s*(.*)$/,

  // For removing all not-word characters (aka anything except letters and ')
  NOT_WORD: /[^a-zA-Z']/g,

  // match op elements (single + multiple lines)
  OP: /{{[^}]*}}/gm,

  // Breakdown:
  // \*\*\s*                  Match "**" and any number of spaces (greedy)
  // ({{(.*?)}})?             Optionally match "{{some stuff}}" (lazy)
  // \s*                      Match any number of spaces (greedy)
  // ((end)|(goto .*))\*\*$   Match only "end" and "goto (any)" until "**" + end of the string.
  TRIGGER: /^\*\*\s*({{(.*?)}})?\s*((end)|(goto .*))\*\*$/,
};
