'use strict';

const fs = require('fs'),
  util = require('util'),
  path = require('path'),
  Generator = require('yeoman-generator'),
  chalk = require('chalk'),
  _ = require('lodash'),
  mkdirp = require('mkdirp')
;

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

const questions = [
  {
    name: 'githubUser',
    message: 'What is your GitHub username?',
    default: 'someuser'
  },
  {
    name: 'realName',
    message: 'Should we use your real name as package author? If so provide it here.',
    default: 'your github username'
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
    this.log(welcome);
  }

  prompting() {
    let prompts = []
      .concat(questions)
    ;

    return this.prompt(prompts)
      .then((answers) => {
        this.githubUser = answers.githubUser;
        this.realName = 'your github username' === answers.realName
          ? this.githubUser
          : answers.realName
        ;

        this.themeName = _.kebabCase(answers.themeName).replace(/^(bespoke-)?theme-/, '').toLowerCase();
        this.themeNameCamelized = _.camelCase(this.themeName);
        this.themeFullName = 'bespoke-theme-' + this.themeName;

        this.themeDescription = answers.themeDescription;
        this.license = answers.license;

        this.githubUrl = 'https://github.com/' + this.githubUser + '/' + this.themeFullName;
      }
    );
  }

  default() {
    this.packageJson = {
      name: this.themeFullName,
      version: '1.0.0',
      description: this.themeDescription,
      homepage: this.githubUrl + '/' + this.themeFullName,
      bugs: this.githubUrl + '/' + this.themeFullName + '/issues',
      author: {
        'name': this.realName,
        'url': 'https://github.com/' + this.githubUser + '/' + this.themeFullName
      },
      main: './dist/' + this.themeFullName + '.js',
      repository: {
        'type': 'git',
        'url': 'git://github.com/' + this.githubUser + '/' + this.themeFullName + '.git'
      },
      licenses: [
        {
          'type': this.license
        }
      ],
      scripts: {
        'test': 'gulp'
      },
      peerDependencies: {
        'bespoke': '>=1.1.0'
      },
      devDependencies: {
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
      engines: {
        'node': '>=4.0.0'
      },
      keywords: [
        'bespoke-plugin',
        'bespoke-theme'
      ]
    };
    this.bowerJson = {
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
  }

  writing() {
    const SRC_ROOT = this.sourceRoot();

    mkdirp('lib');
    this.fs.copy(SRC_ROOT + '/lib/name.js', 'lib/' + this.themeFullName + '.js');
    this.fs.copy(SRC_ROOT + '/lib/theme.styl', 'lib/theme.styl');

    mkdirp('demo/src/scripts');
    this.fs.copy(SRC_ROOT + '/demo/src/index.pug', 'demo/src/index.pug');
    this.fs.copy(SRC_ROOT + '/demo/src/scripts/main.js', 'demo/src/scripts/main.js');

    this.fs.copy(SRC_ROOT + '/gulpfile.js', 'gulpfile.js');

    this.fs.copy(SRC_ROOT + '/CONTRIBUTING.md', 'CONTRIBUTING.md');
    this.fs.copy(SRC_ROOT + '/LICENSE', 'LICENSE');
    this.fs.copy(SRC_ROOT + '/README.md', 'README.md');

    this.fs.copy(SRC_ROOT + '/_editorconfig', '.editorconfig');
    this.fs.copy(SRC_ROOT + '/_gitattributes', '.gitattributes');
    this.fs.copy(SRC_ROOT + '/_gitignore', '.gitignore');
    this.fs.copy(SRC_ROOT + '/_travis.yml', '.travis.yml');
    this.fs.write('package.json', JSON.stringify(this.packageJson, null, 2));
    this.fs.write('bower.json', JSON.stringify(this.bowerJson, null, 2));
  }

  install() {
    this.installDependencies({ bower: false });
  }
};
