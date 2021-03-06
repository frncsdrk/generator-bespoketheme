var gulp = require('gulp'),
  log = require('fancy-log'),
  clean = require('gulp-clean'),
  header = require('gulp-header'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  stylus = require('gulp-stylus'),
  autoprefixer = require('gulp-autoprefixer'),
  csso = require('gulp-csso'),
  pug = require('gulp-pug'),
  connect = require('gulp-connect'),
  plumber = require('gulp-plumber'),
  opn = require('opn'),
  pkg = require('./package.json'),
  browserify = require('gulp-browserify'),
  through = require('through'),
  path = require('path'),
  ghpages = require('gh-pages'),
  camelCase = require('lodash').camelCase,
  template = require('gulp-template'),
  isDemo = process.argv.indexOf('demo') > 0;

gulp.task('default', ['clean', 'compile']);
gulp.task('demo', ['compile', 'watch', 'connect']);
gulp.task('compile', ['compile:lib', 'compile:demo']);
gulp.task('compile:lib', ['stylus', 'browserify:lib']);
gulp.task('compile:demo', ['pug', 'browserify:demo']);

gulp.task('watch', function() {
  gulp.watch('lib/*', ['compile:lib', 'browserify:demo']);
  gulp.watch('demo/src/*.pug', ['pug']);
  gulp.watch('demo/src/**/*.js', ['browserify:demo']);
});

gulp.task('clean', ['clean:browserify', 'clean:stylus', 'clean:pug']);
gulp.task('clean:browserify', ['clean:browserify:lib', 'clean:browserify:demo']);

gulp.task('clean:browserify:lib', function() {
  return gulp.src(['dist'], { read: false })
    .pipe(clean());
});

gulp.task('clean:browserify:demo', function() {
  return gulp.src(['demo/dist/build'], { read: false })
    .pipe(clean());
});

gulp.task('clean:stylus', function() {
  return gulp.src(['lib/tmp'], { read: false })
    .pipe(clean());
});

gulp.task('clean:pug', function() {
  return gulp.src(['demo/dist/index.html'], { read: false })
    .pipe(clean());
});

gulp.task('stylus', ['clean:stylus'], function() {
  return gulp.src('lib/theme.styl')
    .pipe(isDemo ? plumber() : through())
    .pipe(stylus({
      'include css': true,
      'paths': ['./node_modules']
    }))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(csso())
    .pipe(gulp.dest('lib/tmp'));
});

gulp.task('browserify', ['browserify:lib', 'browserify:demo']);

gulp.task('browserify:lib', ['clean:browserify:lib', 'stylus'], function() {
  return gulp.src('lib/<%= themeFullName %>.js')
    .pipe(isDemo ? plumber() : through())
    .pipe(browserify({ transform: ['brfs'], standalone: 'bespoke.themes.<%= themeNameCamelized %>' }))
    .pipe(header([
      '/*!',
      ' * <%= pkg.name %> v<%= pkg.version %>',
      ' *',
      ' * Copyright <%= new Date().getFullYear() %>, <%= pkg.author.name %>',
      ' * This content is released under the <%= pkg.licenses[0].type %> license',
      ' * <%= pkg.licenses[0].url %>',
      ' */\n\n'
    ].join('\n'), { pkg: pkg }))
    .pipe(gulp.dest('dist'))
    .pipe(rename({
      basename: pkg.name,
      suffix: '.min',
      extname: '.js'
    }))
    .pipe(uglify())
    .pipe(header([
      '/*! <%= pkg.name %> v<%= pkg.version %> ',
      '© <%= new Date().getFullYear() %> <%= pkg.author.name %>, ',
      '<%= pkg.licenses[0].type %> License */\n'
    ].join(''), { pkg: pkg }))
    .pipe(gulp.dest('dist'));
});

gulp.task('browserify:demo', ['clean:browserify:demo'], function() {
  return gulp.src('demo/src/scripts/main.js')
    .pipe(isDemo ? plumber() : through())
    .pipe(template({
      themeFullName: pkg.name,
      themeNameCamelized: camelCase(pkg.name)
    }))
    .pipe(browserify({ transform: ['brfs'] }))
    .pipe(rename('build.js'))
    .pipe(gulp.dest('demo/dist/build'))
    .pipe(connect.reload());
});

gulp.task('pug', ['clean:pug'], function() {
  return gulp.src('demo/src/index.pug')
    .pipe(isDemo ? plumber() : through())
    .pipe(template({
      themeFullName: pkg.name,
      themeDescription: pkg.description,
      realName: pkg.author.name,
      githubUser: pkg.repository.url.split('/')[3]
    }))
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest('demo/dist'))
    .pipe(connect.reload());
});

gulp.task('connect', ['compile'], function(done) {
  connect.server({
    root: 'demo/dist',
    livereload: true
  });

  opn('http://localhost:8080', done);
});

gulp.task('deploy', ['compile:demo'], function(done) {
  ghpages.publish(path.join(__dirname, 'demo/dist'), { logger: log }, done);
});
