

var Element = require('./Element');
var util = require('util');

function POS_Element() {
   Element.constructor.apply(this);
}

util.inherits(POS_Element, Element);

POS_Element.prototype.generateFeatures = function(features) {
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

module.exports = POS_Element;
