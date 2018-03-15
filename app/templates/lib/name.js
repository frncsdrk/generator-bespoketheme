var fs = require('fs'),
  classes = require('bespoke-classes'),
  insertCss = require('insert-css')
;

module.exports = function() {
  var css = fs.readFileSync(__dirname + '/tmp/theme.css', 'utf8');
  insertCss(css, { prepend: true });

  return function(deck) {
    classes()(deck);
  };
};
