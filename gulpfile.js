const Autoprefixer = require('gulp-autoprefixer');
const BrowserSync = require('browser-sync').create();
const Changed = require('gulp-changed');
const Concat = require('gulp-concat');
const Declare = require('gulp-declare');
const Gulp = require('gulp');
const Handlebars = require('gulp-handlebars');
const Imagemin = require('gulp-imagemin');
const Merge = require('merge2');
const MinifyCss = require('gulp-minify-css');
const PngQuant = require('imagemin-pngquant');
const Rimraf = require('gulp-rimraf');
const RunSequence = require('run-sequence');
const Sass = require('gulp-sass');
const Wrap = require('gulp-wrap');


Gulp.task('default', ['watch']);

Gulp.task('watch', ['build'], () => {

  Gulp.watch(['app/img/**/*'], ['app-img']);
  Gulp.watch(['app/css/**/*'], ['app-css']);
  Gulp.watch(['app/*.html'], ['app-html']);
  Gulp.watch(['app/js/**/*'], ['app-js']);
  Gulp.watch(['app/themes/*/templates/**/*', 'app/themes/*/partials/**/*'], ['themes-handlebars']);
  Gulp.watch(['app/themes/*/styles/**/*'], ['themes-css']);
  Gulp.watch(['app/themes/*/images/**/*'], ['themes-images']);

  BrowserSync.init({
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


Gulp.task('build', (cb) => {
  RunSequence(
    'clean',
    ['themes', 'app'],
    cb
  );
});


Gulp.task('app', ['app-css', 'app-html', 'app-img', 'app-js'])
Gulp.task('themes', ['themes-css', 'themes-handlebars', 'themes-img']);


Gulp.task('clean', () => {
  return Gulp.src('./dist', { read: false })
      .pipe(Rimraf());
});


function renderImg (src, dest) {
  return Gulp.src(src)
      .pipe(Changed(dest))
      .pipe(Imagemin({
        svgoPlugins: [{removeViewBox: false}],
        use: [PngQuant()]
      }))
      .pipe(Gulp.dest(dest))
      .pipe(BrowserSync.stream());
}

Gulp.task('app-img', () => {
  Gulp.src(['app/favicon.ico'])
        .pipe(Gulp.dest('dist'));
  return renderImg(['app/img/**/*'], 'dist/img');
});

Gulp.task('themes-img', () => {
  return renderImg(['app/themes/*/images/**/*'], 'dist/themes');
});


function renderCSS (src, dest) {
  return Gulp.src(src)
      .pipe(Changed(dest))
      .pipe(Sass().on('error', Sass.logError))
      .pipe(Autoprefixer({
          browsers: ['last 2 versions']
      }))
      .pipe(MinifyCss())
      .pipe(Gulp.dest(dest))
      .pipe(BrowserSync.stream());
}

Gulp.task('app-css', () => {
  return renderCSS(['app/css/*.scss'], 'dist/css');
});

Gulp.task('themes-css', () => {
  return renderCSS(['app/themes/*/styles/**/*.scss'], 'dist/themes');
});


Gulp.task('app-html', () => {
  return Gulp.src(['app/*.html'])
      .pipe(Changed('dist'))
      .pipe(Gulp.dest('dist'))
      .pipe(BrowserSync.stream());
});


Gulp.task('app-js', () => {
  return Gulp.src(['app/js/**/*.js'])
      .pipe(Changed('dist/js'))
      .pipe(Gulp.dest('dist/js'))
      .pipe(BrowserSync.stream());
});


Gulp.task('themes-handlebars', () =>{
  return Gulp.src(['app/themes/*/templates/*.hbs', 'app/themes/*/partials/*.hbs'])
      .pipe(Handlebars())
      .pipe(Wrap('Handlebars.template(<%= contents %>)'))
      .pipe(Declare({
        namespace: 'Expedition',
        noReDeclare: true, // Avoid duplicate declarations
        processName: function(filepath) {
          return Declare.processNameByPath(filepath.replace('app\\themes\\',''));
        }
      }))
      .pipe(Concat('Handlebars-helpers.js'))
      .pipe(Gulp.dest('dist/js/'))
      .pipe(BrowserSync.stream());
});