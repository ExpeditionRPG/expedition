import {Logger} from '../../render/Logger';
import {sanitizeCombat} from './Combat';
import {sanitizeDecision} from './Decision';
import {TemplateBodyType, TemplateType} from './Templates';

export function sanitizeTemplate(type: TemplateType, attribs: {[k: string]: any}, body: TemplateBodyType, line: number, defaultOutcome: any, log: Logger): {body: TemplateBodyType, attribs: {[k: string]: any}} {
  switch (type) {
    case 'combat':
      return sanitizeCombat(attribs, body, line, defaultOutcome, log);
    case 'decision':
      return sanitizeDecision(attribs, body, line, defaultOutcome, log);
    case 'roleplay':
      return {body, attribs};
    default:
      throw new Error('unimplemented');
  }
}
