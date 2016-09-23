const Autoprefixer = require('gulp-autoprefixer');
const BrowserSync = require('browser-sync').create();
const Changed = require('gulp-changed');
const Concat = require('gulp-concat');
const Declare = require('gulp-declare');
const Gulp = require('gulp');
const GulpIf = require('gulp-if');
const Handlebars = require('gulp-handlebars');
const Imagemin = require('gulp-imagemin');
const Insert = require('gulp-insert');
const Merge = require('merge2');
const MinifyCss = require('gulp-minify-css');
const PngQuant = require('imagemin-pngquant');
const Rimraf = require('gulp-rimraf');
const RunSequence = require('run-sequence');
const Sass = require('gulp-sass');
const Webpack = require('webpack-stream');
const Wrap = require('gulp-wrap');


Gulp.task('default', ['watch']);

Gulp.task('watch', ['build'], () => {

  Gulp.watch(['app/img/**/*'], ['app-images']);
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


Gulp.task('app', ['app-css', 'app-html', 'app-images', 'app-js'])
Gulp.task('themes', ['themes-css', 'themes-handlebars', 'themes-images']);


Gulp.task('clean', () => {
  return Gulp.src('./dist', { read: false }).pipe(Rimraf());
});


function renderImages (src, dest) {
  return Gulp.src(src)
      .pipe(Changed(dest))
      .pipe(Imagemin({
        svgoPlugins: [{removeViewBox: false}],
        use: [PngQuant()]
      }))
      .pipe(Gulp.dest(dest))
      .pipe(BrowserSync.stream());
}

Gulp.task('app-images', () => {
  Gulp.src('app/favicon.ico').pipe(Gulp.dest('dist'));
  return renderImages(['app/img/**/*'], 'dist/img');
});

Gulp.task('themes-images', () => {
  return renderImages(['app/themes/*/images/**/*'], 'dist/themes');
});


Gulp.task('app-css', () => {
  return Gulp.src('app/css/*.scss')
      .pipe(Changed('dist/css'))
      .pipe(Sass().on('error', Sass.logError))
      .pipe(Autoprefixer({
          browsers: ['last 2 versions'],
      }))
      .pipe(MinifyCss())
      .pipe(Gulp.dest('dist/css'))
      .pipe(BrowserSync.stream());
});


Gulp.task('themes-css', () => {
  return Gulp.src(['app/themes/*/styles/**/*.scss'])
      .pipe(Insert.transform((contents, file) => {
        const themeName = extractThemeName(file.path);
        contents = contents.replace(/url\(\.\./g, "url(/themes/" + themeName + "/"); // modify URL paths
        return '#renderArea[data-theme="' + themeName + '"] {' + contents + '}';
      }))
      .pipe(Sass().on('error', Sass.logError))
      .pipe(Autoprefixer({
          browsers: ['last 2 versions'],
      }))
      .pipe(MinifyCss())
      .pipe(Concat('themes.css'))
      .pipe(Gulp.dest('dist/css'))
      .pipe(BrowserSync.stream());
});


Gulp.task('app-html', () => {
  return Gulp.src(['app/*.html'])
      .pipe(Changed('dist'))
      .pipe(Gulp.dest('dist'))
      .pipe(BrowserSync.stream());
});


Gulp.task('app-js', () => {
  return Merge(
    Gulp.src(['app/js/**/*.js'])
        .pipe(Changed('dist/js'))
        .pipe(Gulp.dest('dist/js'))
        .pipe(BrowserSync.stream()),
    Gulp.src('app/js/app.js')
        .pipe(Webpack(require('./webpack.config.js')))
        .pipe(Gulp.dest('dist/js'))
        .pipe(BrowserSync.stream())
    );
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


function extractThemeName (filepath) {
  const encoded = filepath.split('\\').join('\\'); // double backslashes to safely encode them
  const themeNameRegex = /themes[\\//]([-_a-zA-Z0-9]*)/;
  return encoded.match(themeNameRegex)[1];
}