/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob');
var historyApiFallback = require('connect-history-api-fallback');
var packageJson = require('./package.json');
var crypto = require('crypto');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var styleTask = function (stylesPath, srcs) {
  return gulp.src(srcs.map(function(src) {
      return path.join('app', stylesPath, src);
    }))
    .pipe($.changed(stylesPath, {extension: '.css'}))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/' + stylesPath))
    .pipe($.cssmin())
    .pipe(gulp.dest('www/' + stylesPath))
    .pipe($.size({title: stylesPath}));
};

var imageOptimizeTask = function (src, dest) {
  return gulp.src(src)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(dest))
    .pipe($.size({title: 'images'}));
};

var optimizeHtmlTask = function (src, dest) {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app', 'www']});

  return gulp.src(src)
    // Replace path for vulcanized assets
    .pipe($.if('*.html', $.replace('elements/elements.html', 'elements/elements.vulcanized.html')))
    .pipe(assets)
    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.cssmin()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Output files
    .pipe(gulp.dest(dest))
    .pipe($.size({title: 'html'}));
};

// Compile and automatically prefix stylesheets
gulp.task('styles', function () {
  return styleTask('styles', ['**/*.css']);
});

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src([
      'app/scripts/**/*.js',
      '!app/scripts/**/*.min.js',
      'app/elements/**/*.js',
      'app/elements/**/*.html',
      'gulpfile.js'
    ])
    .pipe($.jshint.extract()) // Extract JS from .html files
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Optimize images
gulp.task('images', function () {
  return imageOptimizeTask('app/images/**/*', 'www/images');
});

// Copy all files at the root level (app)
gulp.task('copy', function () {
  var app = gulp.src([
    'app/*',
    '!app/test',
    '!app/cache-config.json'
  ], {
    dot: true
  }).pipe(gulp.dest('www'));

  var bower = gulp.src([
    'app/bower_components/**/*'
  ]).pipe(gulp.dest('www/bower_components'));

  var elements = gulp.src(['app/elements/**/*.html',
                           'app/elements/**/*.css',
                           'app/elements/**/*.js'])
    .pipe(gulp.dest('www/elements'));

  var quests = gulp.src(['app/quests/**/*'])
    .pipe(gulp.dest('www/quests'));

  var scripts = gulp.src(['app/scripts/*'])
    .pipe(gulp.dest('www/scripts'));

  var swBootstrap = gulp.src(['bower_components/platinum-sw/bootstrap/*.js'])
    .pipe(gulp.dest('www/elements/bootstrap'));

  var swToolbox = gulp.src(['bower_components/sw-toolbox/*.js'])
    .pipe(gulp.dest('www/sw-toolbox'));

  var vulcanized = gulp.src(['app/elements/elements.html'])
    .pipe($.rename('elements.vulcanized.html'))
    .pipe(gulp.dest('www/elements'));

  return merge(app, bower, elements, scripts, quests, vulcanized, swBootstrap, swToolbox)
    .pipe($.size({title: 'copy'}));
});

// Render globals.json into globals-behavior.html to eliminate need for synchronous network call
gulp.task('renderGlobals', function () {
  return gulp.src('app/elements/base/globals-behavior.html')
    .pipe($.replace('dataGlobal = {};', 'dataGlobal = ' + fs.readFileSync('./app/scripts/globals.json')))
    .pipe(gulp.dest('.tmp/elements/base'))
    .pipe(gulp.dest('www/elements/base'));
});

// Copy web fonts to www
gulp.task('fonts', function () {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('www/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Scan your HTML for assets & optimize them
gulp.task('html', function () {
  return optimizeHtmlTask(
    ['app/**/*.html', '!app/{elements,test}/**/*.html'],
    'www');
});

// Vulcanize granular configuration
gulp.task('vulcanize', function() {
  return gulp.src('app/elements/elements.html')
    .pipe($.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe(gulp.dest('www/elements'))
    .pipe($.size({title: 'vulcanize'}));
});

// Rename Polybuild's index.build.html to index.html
gulp.task('rename-index', function () {
  return gulp.src('www/index.build.html')
    .pipe($.rename('index.html'))
    .pipe(gulp.dest('www/'));
});

gulp.task('remove-old-build-index', function () {
  return del('www/index.build.html');
});

// Generate config data for the <sw-precache-cache> element.
// This include a list of files that should be precached, as well as a (hopefully unique) cache
// id that ensure that multiple PSK projects don't share the same Cache Storage.
// This task does not run by default, but if you are interested in using service worker caching
// in your project, please enable it within the 'default' task.
// See https://github.com/PolymerElements/polymer-starter-kit#enable-service-worker-support
// for more context.
gulp.task('cache-config', function (callback) {
  var dir = 'www';
  var config = {
    cacheId: packageJson.name || path.basename(__dirname),
    disabled: false
  };

  glob('{elements,scripts,styles}/**/*.*', {cwd: dir}, function(error, files) {
    if (error) {
      callback(error);
    } else {
      files.push('index.html', './', 'bower_components/webcomponentsjs/webcomponents-lite.min.js');
      config.precache = files;

      var md5 = crypto.createHash('md5');
      md5.update(JSON.stringify(config.precache));
      config.precacheFingerprint = md5.digest('hex');

      var configPath = path.join(dir, 'cache-config.json');
      fs.writeFile(configPath, JSON.stringify(config), callback);
    }
  });
});

// Clean output directory
gulp.task('clean', function (cb) {
  del(['.tmp', 'www'], cb);
});

// Watch files for changes & reload
gulp.task('serve', ['styles', 'renderGlobals', 'images'], function () {
  browserSync({
    port: 5000,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function (snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp', 'app'],
      middleware: [ historyApiFallback() ],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
  gulp.watch(['app/{scripts,elements}/**/{*.js,*.html}'], ['jshint']);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the www build
gulp.task('serve:www', ['default'], function () {
  browserSync({
    port: 5001,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function (snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'www',
    middleware: [ historyApiFallback() ]
  });
});

// Build production files, the default task
gulp.task('default', ['clean'], function (cb) {
  // Uncomment 'cache-config' after 'rename-index' if you are going to use service workers.
  runSequence(
    ['copy', 'styles'],
    'renderGlobals',
    ['jshint', 'images', 'fonts', 'html'],
    'vulcanize','rename-index', 'remove-old-build-index', // 'cache-config',
    cb);
});

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
