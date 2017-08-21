/*
    Element class for elements in the event space
    Copyright (C) 2017 Hugo W.L. ter Doest

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var Feature = require('./Feature');

function Element(a, b) {
  this.a = a;
  this.b = b;
}

Element.prototype.toString = function() {
  if (!this.key) {
    this.key =  this.a + this.b.toString();
  }
  return this.key;
};

Element.prototype.generateFeatures = function(features) {
  var context = this.b.data;
  var tag = this.a;

  var token = context.wordWindow["0"];
  function f(x) {
    if ((x.b.data.wordWindow["0"] === token) &&
        (x.a === tag)) {
        return 1;
    }
    return 0;
  }
  features.push(new Feature(f));

  // Feature for previous bigram (previous two tags), positions -2, -1
  if (context.tagWindow["-2"]) {
    var prevPrevTag = context.tagWindow["-2"];
    var prevTag = context.tagWindow["-1"];
    function g(x) {
      if ((x.a === tag) &&
          (x.b.data.tagWindow["-2"] === prevPrevTag) &&
          (x.b.data.tagWindow["-1"] === prevTag)) {
          return 1;
        }
      return 0;
    }
    features.push(new Feature(g));
  }

  // Feature for left bigram, positions -1, 0
  if (context.tagWindow["-1"]) {
    var prevTag = context.tagWindow["-1"];
    function g1(x) {
      if ((x.b.data.tagWindow["-1"] === prevTag) &&
          (x.a === tag)) {
          return 1;
        }
      return 0;
    }
    features.push(new Feature(g1));
  }

  // Feature for right bigram, positions 0, 1
  if (context.tagWindow["1"]) {
    var nextTag = context.tagWindow["1"];
    function h1(x) {
      if ((x.a === tag) &&
          (x.b.data.tagWindow["1"] === nextTag)) {
          return 1;
        }
      return 0;
    }
    features.push(new Feature(h1));
  }

  // Feature for next bigram (next two tags), positions 1 and 2
  if (context.tagWindow["2"]) {
    var nextTag = context.tagWindow["1"];
    var nextNextTag = context.tagWindow["2"];
    function h(x) {
      if ((x.a === tag) &&
          (x.b.data.tagWindow["1"] === nextTag) &&
          (x.b.data.tagWindow["2"] === nextNextTag)) {
          return 1;
        }
      return 0;
    }
    features.push(new Feature(h));
  }

  return features;
};

module.exports = Element;
