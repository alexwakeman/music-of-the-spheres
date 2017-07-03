var gulp = require('gulp');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var karma = require('karma');
var gutil = require('gutil');
var babel = require('gulp-babel');
var react = require('gulp-react');

// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
var dependencies = [
	{'react': ''},
	{'react-dom': ''},
	{'redux': ''},
	{'react-redux': ''},
	{'prop-types': ''},
	{'three': ''}
];

gulp.task('app', function () {
	return browserify({entries: './src/js/bootstrap.jsx', extensions: ['.jsx'], debug: true})
		.transform('babelify', {presets: ['es2015', 'react']})
		.bundle()
		.pipe(source('app.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('libs', function () {
	return gulp.src('output/*.js')
		.pipe(babel())
		.pipe(concat('app.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('sass', () => {
	return gulp.src('src/scss/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('dist/css'));
});

gulp.task('build', ['app:dev', 'sass']);

gulp.task('watch', ['build'], function() {
	gulp.watch('src/scss/*.scss', ['sass']);
	gulp.watch('src/**/*.ts', ['app']);
});

gulp.task('test', (done) => {
	var server = new karma.Server({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, function() {
		done();
	});
	server.start();
});
