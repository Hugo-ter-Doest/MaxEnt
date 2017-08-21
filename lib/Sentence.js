

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

    // Current word and tag
    x.b.data.wordWindow["0"] = token.token;
    x.b.data.tagWindow["0"] = sentence[index].tag;

    // Previous bigram
    if (index > 1) {
      x.b.data.tagWindow["-2"] = sentence[index - 2].tag;
      x.b.data.wordWindow["-2"] = sentence[index - 2].token;
    }

    // Left bigram
    if (index > 0) {
      x.b.data.tagWindow["-1"] = sentence[index - 1].tag;
      x.b.data.wordWindow["-1"] = sentence[index - 1].token;
    }

    // Right bigram
    if (index < sentence.length - 1) {
      x.b.data.tagWindow["1"] = sentence[index + 1].tag;
      x.b.data.wordWindow["1"] = sentence[index + 1].token;
    }

    // Next bigram
    if (index < sentence.length - 2) {
      x.b.data.tagWindow["2"] = sentence[index + 2].tag;
      x.b.data.wordWindow["2"] = sentence[index + 2].token;
    }

    sample.addElement(x);
  });
};

module.exports = Sentence;
