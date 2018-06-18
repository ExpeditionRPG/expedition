const fs = require('fs');
const expect = require('expect');

const WHITELIST = ['reducers/', 'Container$'];
const WHITELIST_REGEX = new RegExp(WHITELIST.join('|'));

function walkDir(root) {
  const stat = fs.statSync(root);
  if (stat.isDirectory()) {
      const dirs = fs.readdirSync(root).filter(item => !item.startsWith('.'));
      let results = dirs.map(sub => walkDir(`${root}/${sub}`));
      return [].concat(...results);
  } else {
      return [root];
  }
}

describe('Typescript files', () => {
  it('are always in pairs of *.tsx and *.test.tsx', () => {
    const files = walkDir('./app');

    let count = {};
    for (let f of files) {
      const ext = f.split('.').pop();
      if ((ext === 'tsx' || ext === 'ts') && f.indexOf('TestData') === -1) {
        const base = f.split('.')[1]; // "./app/..."
        count[base] = (count[base] || 0) + 1;
      }
    }

    let violations = [];
    for (let k of Object.keys(count)) {
      if (count[k] !== 2 && !WHITELIST_REGEX.test(k)) {
        violations.push(k);
      }
    }
    expect(violations).toEqual([]);
  });
});
