/*global describe, beforeEach, it*/
'use strict';

const path = require('path'),
  assert = require('yeoman-assert'),
  helpers = require('yeoman-test');

describe('bespoketheme generator', function () {
  beforeEach(() => {});

  it('creates expected files', function (done) {
    this.timeout(5000);
    let expected = [
      '.editorconfig',
      '.gitattributes',
      '.gitignore',
      '.travis.yml',
      'bower.json',
      'CONTRIBUTING.md',
      'gulpfile.js',
      'LICENSE',
      'package.json',
      'README.md',
      'lib/bespoke-theme-foobar.js',
      'lib/theme.styl',
    ];
    helpers
      .run(path.join(__dirname, '../app'))
      .withPrompts({
        'themeName': 'foobar',
        'themeDescription': 'Foo bar baz',
        'githubUser': ''
      })
      .then((dir) => {
        assert.file(expected);
        done();
      })
  });
});
