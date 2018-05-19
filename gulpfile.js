var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var karma = require('karma');
var gutil = require('gutil');
var react = require('gulp-react');

var libs = ['react', 'react-dom', 'redux', 'react-redux', 'prop-types', 'three'];

gulp.task('app', function () {
	var bundler = browserify({entries: './src/js/bootstrap.jsx', extensions: ['.jsx'], debug: true});

	libs.forEach(function(lib) {
		bundler.external(require.resolve(lib, { expose: lib }));
	});

	return bundler.transform('babelify', {presets: ['es2015', 'react']})
		.bundle()
		.on('error', gutil.log)
		.pipe(source('app.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('libs', function () {
	var bundler = browserify({
		debug: false
	});

	libs.forEach(function(lib) {
		bundler.require(lib);
	});

	bundler.bundle()
		.pipe(source('libs.js'))
		// .pipe(buffer())
		// .pipe(uglify())
		.on('error', gutil.log)
		.pipe(gulp.dest('dist/js'));
});

gulp.task('sass', () => {
	return gulp.src('src/scss/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('dist/css'));
});

gulp.task('build', ['libs', 'app', 'sass']);

gulp.task('watch', ['build'], function() {
	gulp.watch('src/scss/*.scss', ['sass']);
	gulp.watch(['src/**/*.js', 'src/**/*.jsx'], ['app']);
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
