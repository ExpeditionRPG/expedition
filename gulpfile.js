const babelify = require('babelify');
const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const watchify = require('watchify');


gulp.task('browserify', () => {

  const bundler = browserify({
    entries: ['./react.js'], // Only need initial file, browserify finds the deps
    debug: true, // Gives us sourcemapping
    cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
  })
  .transform('babelify', { presets: ["es2015", "react"] });

  const watcher = watchify(bundler);

  return watcher
    .on('update', () => { // When any files update
      console.log('JS file update detected, re-processing');
      watcher
        .bundle() // Create new bundle that uses the cache for high performance
        .on('error', (err) => {
          console.log(err);
        })
        .pipe(source('react.js'))
// This is where you add uglifying etc.
// TODO this is a duplicate of the bundle, source, etc below - streamline / unify
        .pipe(gulp.dest('./public/js/'));
    })
    .bundle() // Create the initial bundle when starting the task
    .on('error', (err) => {
      console.log(err);
    })
    .pipe(source('react.js'))
    .pipe(gulp.dest('./public/js/'));
});


gulp.task('default', ['browserify']);