'use strict';
// https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var assign = require('lodash.assign');
var babelify = require("babelify");
var nodemon = require('gulp-nodemon');
var transform = require('vinyl-transform');
var eventStream = require('event-stream');

var entries = ['./client/avatar.js', './client/control.js'];

gulp.task('client', function () {
    var streams = entries.map(function(fileName) {
        var bundler = watchify(browserify(fileName,
            {debug: true})
          ).transform(babelify.configure({
            presets: ['es2015']
          }));

        var watchfn = getWatchifyHandler(bundler, fileName);

        bundler.on('update', watchfn);
        bundler.on('log', gutil.log); // watchify doesn't log by itself

        return watchfn(); // run the actual build for the first time
    });
    return eventStream.merge(streams)
});

function getWatchifyHandler(bundler, fileName) {
  return function() {
    gutil.log('Begin build for', fileName);
    var moduleName = /\/\w+\/(\w+)\.js/g.exec(fileName)[1];

    return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(moduleName + '/bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./public'));
  }
}

gulp.task('server', ['client'], function (cb) {
  return nodemon({
      script: './server/app.js',
      watch: './server/'
  });
});


gulp.task('default', ['server']);
