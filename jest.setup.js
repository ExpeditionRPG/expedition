// Runs before every test file in the jsdom project.
//
// Previously each of the twelve component test files configured the Enzyme
// adapter itself (and services/app/src/Testing.tsx did it a thirteenth time),
// so adding a component test meant remembering the boilerplate. Doing it once
// here is the supported pattern and removes that footgun.
// jsdom does not expose the WHATWG encoding globals that Node has had since
// v11, and cheerio (pulled in by enzyme) requires them at import time. These
// must be installed before anything below requires enzyme.
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

Enzyme.configure({ adapter: new Adapter() });

// jsdom does not implement these, and components under test call them.
// Without stubs the failures surface as confusing "not a function" errors
// rather than as the assertion that actually failed.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = function(query) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: function() {},
        removeListener: function() {},
        addEventListener: function() {},
        removeEventListener: function() {},
        dispatchEvent: function() {
          return false;
        },
      };
    };
  }
  if (!window.scrollTo) {
    window.scrollTo = function() {};
  }
}
