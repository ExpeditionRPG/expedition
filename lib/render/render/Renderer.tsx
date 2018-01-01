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
export function sanitizeStyles(text: string): string {

  // First, store and remove the contents of {{ops}} so they don't interfere with styling
  // We do this with basic bracket counting to avoid complicated and expensive regex parsing.
  // This handles the cases of escaped characters, curlies in strings, and MathJS objects
  // which would normally confuse op node extraction.
  const ops: string[] = [];
  let startOfCapture: number|undefined = undefined;
  let syntaxStack: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const c1 = text[i];
    const c2 = text[i+1];

    if (syntaxStack.length > 0) {
      const lastSyntax = syntaxStack[syntaxStack.length-1];

      // Escaped sequences escape the next character
      if (c1 === '\\') {
        i++;
      }
      // Check for string parsing, which disables any curly chcking while inside the string.
      else if (c1 === '"') {
        if (lastSyntax !== c1) {
          syntaxStack.push(c1);
        } else {
          syntaxStack.pop();
        }
      }
      // Check for final completion of the op section
      else if (lastSyntax !== '"' && c1 === '}' && c2 === '}') {
        let openCurlyCount = 0; // Open curlies not including the initial '{{' of the op
        for (const s of syntaxStack) {
          openCurlyCount += (s === '{') ? 1 : 0;
        }

        // We count an op node as 'complete' if the closing double-curly cannot belong to
        // two distinct, in-op open curly braces.
        if (openCurlyCount < 2) {
          syntaxStack.pop();

          // Extract and save the op, removing it from the text.
          const endOfCapture = i;
          const op = text.slice(startOfCapture, endOfCapture);
          ops.push(op);
          text = text.slice(0, startOfCapture) + text.slice(endOfCapture);
          i -= op.length;
        }
      }
      // then handle single-char curlies
      else if (c1 === '{') {
        syntaxStack.push(c1);
      } else if (c1 === '}' && lastSyntax === '{') {
        syntaxStack.pop();
      }
    } else if (c1 === '{' && c2 === '{') {
      syntaxStack.push('{{');

      // Mark the start of an op node whenever we see the first '{{''
      startOfCapture = i + 2; // +2 to account for the opening brackets
      i++; // skip over the second open bracket
    }
  }

  // Now extract [art] and :icons:
  // This uses the global tag to statefully search for values.
  const art_or_icon = new RegExp(`(${REGEX.ART.source}|${REGEX.ICON.source})`, 'g');
  const art: string[] = [];
  let matches = art_or_icon.exec(text);
  while (matches) {
    art.push(matches[1]);
    matches = art_or_icon.exec(text);
  }
  text = text.replace(art_or_icon, '[art]');

  // replace whitelist w/ markdown
  text = text.replace(/<strong>(.*?)<\/strong>/igm, '**$1**');
  text = text.replace(/<b>(.*?)<\/b>/igm, '**$1**');
  text = text.replace(/<em>(.*?)<\/em>/igm, '*$1*');
  text = text.replace(/<i>(.*?)<\/i>/igm, '*$1*');
  text = text.replace(/<del>(.*?)<\/del>/igm, '~~$1~~');

  // strip html tags and attributes (but leave contents)
  text = text.replace(new RegExp(REGEX.HTML_TAG.source, 'g'), '');

  // replace markdown with HTML tags
  // general case: replace anything surrounded by markdown styles with their matching HTML tag:
  // \*\*([^\*]*)\*\*       non-greedily match the contents between two sets of **
  text = text.replace(new RegExp(REGEX.BOLD_ASTERISKS.source, 'g'), '<b>$1</b>');
  text = text.replace(new RegExp(REGEX.BOLD_UNDERSCORES.source, 'g'), '<b>$1</b>');
  text = text.replace(new RegExp(REGEX.ITALIC_ASTERISKS.source, 'g'), '<i>$1</i>');
  text = text.replace(new RegExp(REGEX.ITALIC_UNDERSCORES.source, 'g'), '<i>$1</i>');
  text = text.replace(new RegExp(REGEX.STRIKETHROUGH.source, 'g'), '<del>$1</del>');

  // Insert stored ops contents back into ops
  text = text.replace(/{{}}/g, () => { return '{{' + ops.shift() + '}}'; });
  text = text.replace(/\[art\]/g, () => {
    const a = art.shift();
    if (a === undefined) {
      throw new Error('Mismatch in [art] tag vs captured art');
    }
    return a;
  });

  return text;
}
