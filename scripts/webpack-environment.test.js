const vm = require('vm');

// Check the values webpack actually substitutes, including beta release builds.
describe('browser runtime and deployment environments', () => {
  const original = process.env.NODE_ENV;
  afterEach(() => {
    if (original === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = original;
    jest.resetModules();
  });

  test.each([undefined, 'dev', 'beta', 'production'])(
    'keeps optimized release libraries without changing channel %s',
    channel => {
      if (channel === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = channel;
      jest.resetModules();
      for (const [file, runtime] of [
        ['../shared/webpack.dist.shared', 'production'],
        ['../shared/webpack.shared', 'development'],
      ]) {
        const config = require(file);
        const definitions = config.plugins.find(p => p.definitions).definitions;
        expect(JSON.parse(definitions['process.env.NODE_ENV'])).toBe(runtime);
        expect(JSON.parse(definitions['process.env.EXPEDITION_ENV'])).toBe(
          channel || 'dev',
        );
        for (const constants of [
          '../shared/schema/Constants.tsx',
          '../services/admin/src/Constants.tsx',
        ]) {
          const source = require('fs').readFileSync(
            require('path').resolve(__dirname, constants),
            'utf8',
          );
          const expression = source.match(
            /export const NODE_ENV =\s*([^;]+);/,
          )[1];
          const substituted = expression.replace(
            /process\.env\.(EXPEDITION_ENV|NODE_ENV)/g,
            key => definitions[key],
          );
          expect(vm.runInNewContext(substituted)).toBe(channel || 'dev');
        }
      }
    },
  );
});
