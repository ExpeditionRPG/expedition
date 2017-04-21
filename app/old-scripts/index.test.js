const Code = require('code');
const expect = Code.expect;

expect(true).to.be.a.boolean().and.to.not.equal(false);
expect('this string').to.only.include(['this ', 'string']);