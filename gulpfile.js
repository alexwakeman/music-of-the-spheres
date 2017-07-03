var gulp = require('gulp');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var karma = require('karma');
var gutil = require('gutil');

// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
var dependencies = [
	'react',
	'react-dom',
	'redux',
	'react-redux',
	'prop-types',
	'three'
];
// keep a count of the times a task refires
var scriptsCount = 0;


gulp.task('app:dev', () => {
	return bundleApp(false);
});

gulp.task('app:prod', () => {
	return bundleApp(true);
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

function bundleApp(isProduction) {
	scriptsCount++;
	// Browserify will bundle all our js files together in to one and will let
	// us use modules in the front end.
	var appBundler = browserify({
		entries: './src/js/bootstrap.jsx',
		debug: true
	});

	// If it's not for production, a separate vendors.js file will be created
	// the first time gulp is run so that we don't have to rebundle things like
	// react everytime there's a change in the js file
	if (!isProduction && scriptsCount === 1){
		// create vendors.js for dev environment.
		browserify({
			require: dependencies,
			debug: true
		})
			.bundle()
			.on('error', gutil.log)
			.pipe(source('libs.js'))
			.pipe(gulp.dest('./dist/js/'));
	}
	if (!isProduction){
		// make the dependencies external so they dont get bundled by the
		// app bundler. Dependencies are already bundled in vendor.js for
		// development environments.
		dependencies.forEach(function(dep){
			appBundler.external(dep);
		})
	}

	appBundler
	// transform ES6 and JSX to ES5 with babelify
		.transform('babelify', {presets: ['es2015', 'react']})
		.bundle()
		.on('error',gutil.log)
		.pipe(source('app.js'))
		.pipe(gulp.dest('./dist/js/'));
}