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

const Merge = require('merge2');


gulp.task('default', ['watch']);

gulp.task('watch', ['build'], () => {

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


gulp.task('build', (cb) => {
  runSequence(
    'clean',
    'themes-handlebars',
    ['app', 'themes', ],
    cb
  );
});


gulp.task('app', ['app-css', 'app-html', 'app-img', 'app-js'])
gulp.task('themes', ['themes-css', 'themes-img']);


gulp.task('clean', () => {
  return gulp.src('./dist', { read: false })
      .pipe(rimraf());
});


function renderImg (src, dest) {
  return gulp.src(src)
      .pipe(changed(dest))
      .pipe(imagemin({
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
      }))
      .pipe(gulp.dest(dest))
      .pipe(browserSync.stream());
}

gulp.task('app-img', () => {
  gulp.src(['app/favicon.ico'])
        .pipe(gulp.dest('dist'));
  return renderImg(['app/img/**/*'], 'dist/img');
});

gulp.task('themes-img', () => {
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

gulp.task('app-css', () => {
  return renderCSS(['app/css/*.scss'], 'dist/css');
});

gulp.task('themes-css', () => {
  return renderCSS(['app/themes/*/styles/**/*.scss'], 'dist/themes');
});


gulp.task('app-html', () => {
  return gulp.src(['app/*.html'])
      .pipe(changed('dist'))
      .pipe(gulp.dest('dist'))
      .pipe(browserSync.stream());
});


gulp.task('app-js', () => {
  return Merge(
    gulp.src(['dist/js/handlebars-helpers.js', 'app/js/app.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream()),
    gulp.src(['app/js/**/*.js', '!app/js/app.js'])
        .pipe(changed('dist/js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream())
  );
});


gulp.task('themes-handlebars', () =>{
  return gulp.src(['app/themes/*/templates/*.hbs', 'app/themes/*/partials/*.hbs'])
      .pipe(handlebars())
      .pipe(wrap('Handlebars.template(<%= contents %>)'))
      .pipe(declare({
        namespace: 'Expedition',
        noRedeclare: true, // Avoid duplicate declarations
        processName: function(filepath) {
          return declare.processNameByPath(filepath.replace('app\\themes\\',''));
        }
      }))
      .pipe(concat('handlebars-helpers.js'))
      .pipe(gulp.dest('dist/js/'))
      .pipe(browserSync.stream());
});