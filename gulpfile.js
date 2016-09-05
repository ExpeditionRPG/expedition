var gulp = require('gulp')
var usemin = require('gulp-usemin')
var rev = require('gulp-rev')
var uglify = require('gulp-uglify')
var del = require('del')

var webpack = require('webpack')
var WebpackServer = require('webpack-dev-server')

gulp.task('clean', function() {
  return del(['dist/*', '.tmp'])
})

gulp.task('assets', function() {
  return gulp.src('app/index.html')
    .pipe(usemin({
      js: [rev(),uglify()]
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('watch', ['clean'], function() {
  var compiler = webpack(require('./webpack.config.js'))

  var server = new WebpackServer(compiler, {
    hot: true,
    contentBase: __dirname + '/app/',
    publicPath: '/assets',
    filename: 'react.js'
  })

  server.listen(8080)
})

gulp.task('build', ['clean'], function(done) {
  webpack(require('./webpack.dist.config.js')).run(function(err, stats) {
    if (err) throw err
    gulp.start(['assets'])
    done()
  })
})

gulp.task('default', ['watch'])