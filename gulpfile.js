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

  gulp.watch(['app/img/**/*'], ['app-img']);
  gulp.watch(['app/css/**/*'], ['app-css']);
  gulp.watch(['app/*.html'], ['app-html']);
  gulp.watch(['app/js/**/*'], ['app-js']);
  gulp.watch(['app/templates/*.hbs'], ['templates']);
  gulp.watch(['app/partials/*.hbs'], ['partials']);
  gulp.watch(['app/themes/*/styles/**/*'], ['themes-css']);
  gulp.watch(['app/themes/*/images/**/*'], ['themes-images']);

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



// TODO split into building the app vs themes
gulp.task('build', function(cb) {
  runSequence(
      'clean',
      ['app', 'themes', 'templates', 'partials'],
      cb);
});


gulp.task('app', ['app-css', 'app-html', 'app-img', 'app-js'])
gulp.task('themes', ['themes-css', 'themes-img']);


gulp.task('clean', function() {
  return gulp.src('./dist', { read: false })
      .pipe(rimraf());
});


function renderImg(src, dest) {
  return gulp.src(src)
      .pipe(changed(dest))
      .pipe(imagemin({
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
      }))
      .pipe(gulp.dest(dest))
      .pipe(browserSync.stream());
}

gulp.task('app-img', function() {
  gulp.src(['app/favicon.ico'])
        .pipe(gulp.dest('dist'));
  return renderImg(['app/img/**/*'], 'dist/img');
});

gulp.task('themes-img', function() {
  return renderImg(['app/themes/*/images/**/*'], 'dist/themes');
});


function renderCSS (src, dest) {
  return gulp.src(src)
      .pipe(changed(dest))
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({
          browsers: ['last 2 versions']
      }))
      .pipe(minifyCss())
      .pipe(gulp.dest(dest))
      .pipe(browserSync.stream());
}

gulp.task('app-css', function() {
  return renderCSS(['app/css/*.scss'], 'dist/css');
});

gulp.task('themes-css', function() {
  return renderCSS(['app/themes/*/styles/**/*.scss'], 'dist/themes');
});


gulp.task('app-html', function() {
  return gulp.src(['app/*.html'])
      .pipe(changed('dist'))
      .pipe(gulp.dest('dist'))
      .pipe(browserSync.stream());
});


gulp.task('app-js', function() {
  return gulp.src(['app/js/**/*.js'])
      .pipe(changed('dist/js'))
      .pipe(gulp.dest('dist/js'))
      .pipe(browserSync.stream());
});


gulp.task('templates', function(){
  return gulp.src(['app/templates/*.hbs'])
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
  return gulp.src(['app/partials/*.hbs'])
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