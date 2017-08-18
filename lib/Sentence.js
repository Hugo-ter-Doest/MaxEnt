

var Context = require('./Context');
var Element = require('./Element');
var Feature = require('./Feature');

function Sentence() {
  this.taggedWords = [];
}

Sentence.prototype.addTaggedWord = function(token, tag) {
  this.taggedWords.push({
    "token": token,
    "tag": tag
  });
};

Sentence.prototype.generateSampleElements = function(sample) {
  var sentence = this.taggedWords;
  sentence.forEach(function(token, index) {
    var x = new Element(
      token.tag,
      new Context({
        wordWindow: {},
        tagWindow: {}
      })
    );

    // Current wordWindow
    x.b.data.wordWindow["0"] = token.token;

    // Previous bigram
    if (index > 1) {
      x.b.data.tagWindow["-2"] = sentence[index - 2].tag;
      x.b.data.tagWindow["-1"] = sentence[index - 1].tag;
    }

    // Left bigram
    if (index > 0) {
      x.b.data.tagWindow["-1"] = sentence[index - 1].tag;
      x.b.data.tagWindow["0"] = sentence[index].tag;
    }


    // Right bigram
    if (index < sentence.length - 1) {
      x.b.data.tagWindow["0"] = sentence[index].tag;
      x.b.data.tagWindow["1"] = sentence[index + 1].tag;
    }

    // Next bigram
    if (index < sentence.length - 2) {
      x.b.data.tagWindow["1"] = sentence[index + 1].tag;
      x.b.data.tagWindow["2"] = sentence[index + 2].tag;
    }

    sample.addElement(x);
  });
};

Sentence.prototype.generateFeatures = function(features) {
  var sentence = this.taggedWords;
  sentence.forEach(function(token, index) {
    // Simple feature for current position
    function f(x) {
      if ((x.b.data.wordWindow) &&
        (x.b.data.wordWindow["0"] === token.token)) {
          return 1;
        }
      return 0;
    }
    var simpleFeature = new Feature(f);
    features.push(simpleFeature);

    // Feature for previous bigram (previous two tags), positions -2, -1
    if ((index > 1) && (sentence.length > 2)) {
      function g(x) {
        if ((x.b.data.wordWindow) &&
          (x.b.data.wordWindow["0"] === token.token) &&
          (x.b.data.tagWindow) &&
          (x.b.data.tagWindow["-2"] === sentence[index - 2].tag) &&
          (x.b.data.tagWindow["-1"] === sentence[index - 1].tag)) {
            return 1;
          }
        return 0;
      }

      var prevBigramFeature = new Feature(g);
      features.push(prevBigramFeature);
    }

    // Feature for left bigram, positions -1, 0
    if ((index > 0) && (sentence.length > 1)) {
      function g1(x) {
        if ((x.b.data.wordWindow) &&
          (x.b.data.wordWindow["0"] === token.token) &&
          (x.b.data.tagWindow) &&
          (x.b.data.tagWindow["-1"] === sentence[index - 1].tag) &&
          (x.b.data.tagWindow["0"] === sentence[index].tag)) {
            return 1;
          }
        return 0;
      }

      var prevBigramFeature = new Feature(g1);
      features.push(prevBigramFeature);
    }

    // Feature for right bigram, positions 0, 1
    if ((index < sentence.length - 1) && (sentence.length > 1)) {
      function h1(x) {
        if ((x.b.data.wordWindow) &&
          (x.b.data.wordWindow["0"] === token.token) &&
          (x.b.data.tagWindow) &&
          (x.b.data.tagWindow["0"] === sentence[index].tag) &&
          (x.b.data.tagWindow["1"] === sentence[index + 1].tag)) {
            return 1;
          }
        return 0;
      }

      var nextBigramFeature = new Feature(h1);
      features.push(nextBigramFeature);
    }

    // Feature for next bigram (next two tags), positions 1 and 2
    if ((index < sentence.length - 2) && (sentence.length > 2)) {
      function h(x) {
        if ((x.b.data.wordWindow) &&
          (x.b.data.wordWindow["0"] === token.token) &&
          (x.b.data.tagWindow) &&
          (x.b.data.tagWindow["1"] === sentence[index + 1].tag) &&
          (x.b.data.tagWindow["2"] === sentence[index + 2].tag)) {
            return 1;
          }
        return 0;
      }

      var nextBigramFeature = new Feature(h);
      features.push(nextBigramFeature);
    }
  });
  return features;
};

module.exports = Sentence;
