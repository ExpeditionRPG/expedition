const gulp = require('gulp');
const runSequence = require('run-sequence');
const rimraf = require('gulp-rimraf');
const changed = require('gulp-changed');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const minifyCss = require('gulp-minify-css');
const handlebars = require('gulp-handlebars');
const wrap = require('gulp-wrap');
const declare = require('gulp-declare');
const concat = require('gulp-concat');


gulp.task('default', ['watch']);


// watch for changes
gulp.task('watch', ['build'], function() {

  gulp.watch(['src/img/**'], ['img']);
  gulp.watch(['src/scss/**'], ['css']);
  gulp.watch(['src/*.html'], ['html']);
  gulp.watch(['src/js/**/*'], ['js']);
  gulp.watch(['src/templates/*.hbs'], ['templates']);
  gulp.watch(['src/partials/*.hbs'], ['partials']);

  browserSync.init({
    port: 8000,
    server: {
      baseDir: "./dist"
    },
    open: false,
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: false,
    },
  });
});


gulp.task('build', function(cb) {
  runSequence(
      'clean',
      ['img', 'css', 'html', 'js', 'templates', 'partials'],
      cb);
});


gulp.task('clean', function() {
  return gulp.src('./dist', { read: false })
      .pipe(rimraf());
});


gulp.task('img', function() {
  gulp.src(['src/favicon.ico'])
        .pipe(gulp.dest('dist'));

  return gulp.src(['src/img/**'])
        .pipe(changed('dist/img'))
        .pipe(imagemin({
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
});


gulp.task('css', function() {
  return gulp.src(['src/scss/*.scss'])
        .pipe(changed('dist/css'))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(minifyCss())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});


gulp.task('html', function() {
  return gulp.src(['src/*.html'])
        .pipe(changed('dist'))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
});


gulp.task('js', function() {
  return gulp.src(['src/js/**/*.js'])
        .pipe(changed('dist/js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});


gulp.task('templates', function(){
  gulp.src(['src/templates/*.hbs'])
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'Expedition.templates',
      noRedeclare: true, // Avoid duplicate declarations
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('dist/js/'))
    .pipe(browserSync.stream());
});


gulp.task('partials', function(){
  gulp.src(['src/partials/*.hbs'])
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'Expedition.partials',
      noRedeclare: true, // Avoid duplicate declarations
    }))
    .pipe(concat('partials.js'))
    .pipe(gulp.dest('dist/js/'))
    .pipe(browserSync.stream());
});