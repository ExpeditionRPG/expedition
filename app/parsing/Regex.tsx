const REGEX = {
  // Breakdown:
  // \*\s*                    Match ">" and any number of spaces (greedy)
  // (\{\{(.*?)\}\})?         Optionally match "{{some stuff}}"
  // \s*                      Match any number of spaces (greedy)
  // (.*)$                    Match until the end of the string.
  INSTRUCTION: /^[>]\s*(\{\{(.*?)\}\})?\s*(.*)$/,

  // Breakdown:
  // \*\*\s*                  Match "**" and any number of spaces (greedy)
  // (\{\{(.*?)\}\})?         Optionally match "{{some stuff}}"
  // \s*                      Match any number of spaces (greedy)
  // ((end)|(goto .*))\*\*$   Match only "end" and "goto (any)" until "**" + end of the string.
  TRIGGER: /^\*\*\s*(\{\{(.*?)\}\})?\s*((end)|(goto .*))\*\*$/,
};

export default REGEX;
