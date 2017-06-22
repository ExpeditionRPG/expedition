import {ErrorType} from './types'

const Fs: any = require('fs');
const Errors: any = require('./errors');

declare var exports: any;


// generate the docs when run
generate();

function generate () {
  Object.keys(Errors).forEach((key: string, index: number) => {
    const err = Errors[key];
    const doc = renderTemplate(err);
    Fs.writeFile(`./docs/errors/${err.NUMBER}.md`, doc, (err: any) => {
      if (err) {
        throw err;
      }
    });
  });
};


function renderTemplate (err: ErrorType) {
  let doc = `# ${err.NUMBER}: ${err.NAME}\n`;
  if (err.DESCRIPTION !== '') {
    doc += `## Details:\n\n${err.DESCRIPTION}\n`;
  }
  if (err.INVALID.length > 0) {
    doc += '## Incorrect:\n\n';
    for (let i = 0; i < err.INVALID.length; i++) {
      doc += '```markdown\n' + err.INVALID[i] + '\n```\n\n';
    }
  }
  if (err.VALID.length > 0) {
    doc += '## Correct:\n\n';
    for (let i = 0; i < err.VALID.length; i++) {
      doc += '```markdown\n' + err.VALID[i] + '\n```\n\n';
    }
  }
  return doc;
}
