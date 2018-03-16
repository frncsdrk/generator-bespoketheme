'use strict';

const fs = require('fs'),
  util = require('util'),
  path = require('path'),
  Generator = require('yeoman-generator'),
  chalk = require('chalk'),
  _ = require('lodash'),
  mkdirp = require('mkdirp'),
  GitHubApi = require('@octokit/rest');

const github = new GitHubApi({
    version: '3.0.0'
  }),
  githubUserInfo = function (user, callback) {
    github.user.getFrom({ user: user }, function (err, res) {
      if (err) { throw err; }
      callback(JSON.parse(JSON.stringify(res)));
    });
  };

// welcome message
let welcome = [
  "",
  chalk.cyan.bold("oooooooooo.                                          oooo                          o8o              "),
  chalk.cyan.bold("`888'   `Y8b                                         `888                          `\"'             "),
  chalk.cyan.bold(" 888     888  .ooooo.   .oooo.o oo.ooooo.   .ooooo.   888  oooo   .ooooo.         oooo  .oooo.o     "),
  chalk.cyan.bold(" 888oooo888' d88' `88b d88(  \"8  888' `88b d88' `88b  888 .8P'   d88' `88b        `888 d88(  \"8   "),
  chalk.cyan.bold(" 888    `88b 888ooo888 `\"Y88b.   888   888 888   888  888888.    888ooo888         888 `\"Y88b.    "),
  chalk.cyan.bold(" 888    .88P 888    .o o.  )88b  888   888 888   888  888 `88b.  888    .o .o.     888 o.  )88b     "),
  chalk.cyan.bold("o888bood8P'  `Y8bod8P' 8\"\"888P'  888bod8P' `Y8bod8P' o888o o888o `Y8bod8P' Y8P     888 8\"\"888P' "),
  chalk.cyan.bold("                                 888                                               888              "),
  chalk.cyan.bold("                                o888o                                          .o. 88P              "),
  chalk.cyan.bold("                                                                               `Y888P               "),
  "",
  chalk.green.bold("Thanks for choosing Bespoke.js for your presentation! :)   -@markdalgleish and contributors"),
  ""
].join('\n');

const packageJson = {
  'scripts': {
    'test': 'gulp'
  },
  'peerDependencies': {
    'bespoke': '>=1.0.0'
  },
  'devDependencies': {
    'bespoke': '^1.1.0',
    'bespoke-backdrop': '^1.0.0',
    'bespoke-bullets': '^1.1.0',
    'bespoke-classes': '^1.0.0',
    'bespoke-keys': '^1.1.0',
    'bespoke-progress': '^1.0.0',
    'bespoke-scale': '^1.0.1',
    'bespoke-touch': '^1.0.0',
    'brfs': '^1.5.0',
    'browserify': '^16.1.1',
    'function-bind': '^1.1.1',
    'gh-pages': '^1.0.0',
    'gulp': '^3.9.1',
    'gulp-autoprefixer': '^3.1.1',
    'gulp-browserify': '^0.5.1',
    'gulp-clean': '^0.4.0',
    'gulp-connect': '^5.0.0',
    'gulp-csso': '^3.0.0',
    'gulp-header': '^2.0.5',
    'gulp-pug': '^3.3.0',
    'gulp-plumber': '^1.1.0',
    'gulp-rename': '^1.2.2',
    'gulp-template': '^5.0.0',
    'gulp-stylus': '^2.6.0',
    'gulp-uglify': '^3.0.0',
    'fancy-log': '^1.3.2',
    'insert-css': '^2.0.0',
    'lodash': '^4.17.5',
    'normalizecss': '^3.0.0',
    'opn': '^5.2.0',
    'through': '^2.3.8'
  },
  'engines': {
    'node': '>=4.0.0'
  },
  'keywords': [
    'bespoke-plugin',
    'bespoke-theme'
  ]
};

const bowerJson = {
  'name': this.themeFullName,
  'version': '1.0.0',
  "main": "./dist/" + this.themeFullName + ".js",
  "ignore": [
    "**/.*"
  ],
  'dependencies': {
    'bespoke.js': '>=1.1.0'
  }
};

const questions = [
  {
    name: 'githubUser',
    message: 'What is your GitHub username?',
    default: 'someuser'
  },
  {
    name: 'themeName',
    message: 'What is the name of your theme?',
    default: 'mytheme'
  },
  {
    name: 'themeDescription',
    message: 'What is the description of your theme?',
    default: 'A theme for Bespoke.js'
  },
  {
    name: 'license',
    message: 'Which license (by identifier) do you want to apply? [see https://spdx.org/licenses]',
    default: 'UNLICENSED'
  }
];

module.exports = class extends Generator {
  initializing() {
    // generators.Base.apply(this, arguments);
    this.props = {};
    this.log(welcome);
  }

  prompting() {
    let prompts = []
      .concat(questions)
    ;

    return this.prompt(prompts)
      .then((answers) => {
        this.themeName = _.kebabCase(answers.themeName).replace(/^(bespoke-)?theme-/, '').toLowerCase();
        this.themeNameCamelized = _.camelCase(this.themeName);
        this.themeFullName = 'bespoke-theme-' + this.themeName;

        this.shortName = _.kebabCase(answers.title);
        this.themeDescription = answers.themeDescription;
        this.license = answers.license;
      }
    );
  }

  default() {
    packageJson.name = this.themeFullName;
    packageJson.version = '1.0.0';
    packageJson.description = this.themeDescription;
    packageJson.homepage = this.githubUrl + '/' + this.themeFullName;
    packageJson.bugs = this.githubUrl + '/' + this.themeFullName + '/issues';
    packageJson.author = {
      'name': this.realName,
      'url': this.githubUrl
    };
    packageJson.main = './dist/' + this.themeFullName + '.js';
    packageJson.repository = {
      'type': 'git',
      'url': 'git://github.com/' + this.githubUser + '/' + this.themeFullName + '.git'
    };
    packageJson.licenses = [
      {
        'type': this.license
      }
    ];
    bowerJson.name = this.themeFullName;
    bowerJson.main = "./dist/" + this.themeFullName + ".js";
  }

  writing() {
    mkdirp('lib');
    this.fs.copy(this._sourceRoot + '/lib/name.js', this.destinationPath('lib/' + this.themeFullName + '.js'));
    this.fs.copy(this._sourceRoot + '/lib/theme.styl', 'lib/theme.styl');

    mkdirp('demo/src/scripts');
    this.fs.copy(this._sourceRoot + '/demo/src/index.pug', 'demo/src/index.pug');
    this.fs.copy(this._sourceRoot + '/demo/src/scripts/main.js', 'demo/src/scripts/main.js');

    this.fs.copy(this._sourceRoot + '/gulpfile.js', 'gulpfile.js');

    this.fs.copy(this._sourceRoot + '/CONTRIBUTING.md', 'CONTRIBUTING.md');
    this.fs.copy(this._sourceRoot + '/LICENSE', 'LICENSE');
    this.fs.copy(this._sourceRoot + '/README.md', 'README.md');

    this.fs.copy(this._sourceRoot + '/_editorconfig', '.editorconfig');
    this.fs.copy(this._sourceRoot + '/_gitattributes', '.gitattributes');
    this.fs.copy(this._sourceRoot + '/_gitignore', '.gitignore');
    this.fs.copy(this._sourceRoot + '/_travis.yml', '.travis.yml');
    this.fs.write('package.json', JSON.stringify(packageJson, null, 2));
    this.fs.write('bower.json', JSON.stringify(bowerJson, null, 2));
  }

  install() {
    this.installDependencies({ bower: false });
  }
};
