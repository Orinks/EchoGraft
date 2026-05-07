const cleancss = require('gulp-clean-css')
const concat = require('gulp-concat')
const gulp = require('gulp')
const header = require('gulp-header')
const gulpif = require('gulp-if')
const iife = require('gulp-iife')
const pkg = require('./package.json')
const uglify = require('gulp-uglify-es').default
const yargs = require('yargs')

const argv = yargs(process.argv).parse()
const isDebug = argv.debug === true

gulp.task('build-css', () => {
  return gulp.src(getCss())
    .pipe(concat('styles.min.css'))
    .pipe(gulpif(!isDebug, cleancss()))
    .pipe(gulp.dest('public'))
})

gulp.task('build-js', () => {
  return gulp.src(getJs())
    .pipe(concat('scripts.min.js'))
    .pipe(header("'use strict';\n\n"))
    .pipe(gulpif(!isDebug, iife()))
    .pipe(gulpif(!isDebug, uglify()))
    .pipe(gulp.dest('public'))
})

gulp.task('build', gulp.series('build-css', 'build-js'))
gulp.task('watch', () => gulp.watch(['src/js/**/*.js', 'src/css/**/*.css'], gulp.series('build')))
gulp.task('dev', gulp.series('build', 'watch'))

function getCss() {
  return [
    'src/css/reset.css',
    'src/css/main.css',
    'src/css/**/*.css',
  ]
}

function getJs() {
  return [
    'node_modules/syngen/dist/syngen.js',
    'src/js/engine.js',
    'src/js/content.js',
    'src/js/content/*.js',
    'src/js/app.js',
    'src/js/app/utility/*.js',
    'src/js/app/*.js',
    'src/js/app/screen/base.js',
    'src/js/app/screen/*.js',
    'src/js/main.js',
  ]
}
