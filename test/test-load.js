/*global describe, beforeEach, it*/
'use strict';

const assert  = require('assert');

describe('bespoketheme generator', function () {
  it('can be imported without blowing up', function () {
    let app = require('../app');
    assert(app !== undefined);
  });
});
