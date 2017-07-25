
var fs = require('fs');

var base_folder_test_data = './spec/data/';
var brownCorpusFile = base_folder_test_data + 'browntag_nolines_excerpt.txt';

var Corpus = require('../lib/Corpus');
var Sample = require('../lib/Sample');
var Classifier = require('../lib/Classifier');
var Feature = require('../lib/Feature');
var Element = require('../lib/Element')
var Context = require('../lib/Context');

var Tagger = require('../lib/Brill_POS_Tagger');

var BROWN = 1;

var features = [];
var classes = [];
var contexts = [];
var lexicon = null;
var sample = new Sample([]);

// Structure of the event space
// - Classes are possible tags
// - A context consists of a window of words and a window of tags

function generateSamplesFromSentence(sentence) {
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
}


function generateFeaturesFromSentence(sentence) {
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
}

function generateFeaturesAndSampleFromCorpus(corpus) {
    corpus.sentences.forEach(function(sentence) {
      generateFeaturesFromSentence(sentence);
      generateSamplesFromSentence(sentence);
      console.log(JSON.stringify(sample, null, 2));

    });
}

function applyClassifierToTestCorpus(lexicon) {
  var totalWords = 0;
  var correctyTaggedLexicon = 0;
  var correctlyTaggedMaxEnt = 0;
  testCorpus.sentences.forEach(function(sentence){
    // Put the words of the sentence in an array
    var s = sentence.map(function(token) {
      return token.token;
    });

    // Use the lexicon to tag the sentence
    var taggedSentence = tagger.tagWithLexicon(s);
    // Count the right tags
    sentence.forEach(function(token, i) {
      totalWords++;
      if (token.tag === taggedSentence[i][1]) {
        correctyTaggedLexicon++;
      }
    });

    // Classify tags
    taggedSentence.forEach(function(taggedWord, index) {

      // Create element for classication
      var context = new Context({
          wordWindow: {},
          tagWindow: {}
      });
      // Current wordWindow
      context.data.wordWindow["0"] = taggedWord[0];
      // Previous bigram
      if (index > 1) {
        context.data.tagWindow["-2"] = taggedSentence[index - 2][1];
        context.data.tagWindow["-1"] = taggedSentence[index - 1][1];
      }
      // Left bigram
      if (index > 0) {
        context.data.tagWindow["-1"] = taggedSentence[index - 1][1];
        context.data.tagWindow["0"] = taggedSentence[index][1];
      }
      // Right bigram
      if (index < sentence.length - 1) {
        context.data.tagWindow["0"] = taggedSentence[index][1];
        context.data.tagWindow["1"] = taggedSentence[index + 1][1];
      }
      // Next bigram
      if (index < sentence.length - 2) {
        context.data.tagWindow["1"] = taggedSentence[index + 1][1];
        context.data.tagWindow["2"] = taggedSentence[index + 2][1];
      }

      // Classify
      var tag = classifier.classify(context);

      // Collect stats
      if (tag === sentence[index].tag) {
        // Correctly tagged
        correctlyTaggedMaxEnt++;
      }
      else {
        console.log("(classification, right tag): " + "(" + tag + ", " + sentence[index].tag + ")");
      }

    });
  });

  console.log("Number of words tagged: " + totalWords);
  console.log("Percentage correctly tagged lexicon: " + correctyTaggedLexicon/totalWords * 100 + "%");
  console.log("Percentage correctly tagged maxent:  " + correctlyTaggedMaxEnt/totalWords * 100 + "%");
}

// Prepare the train and test corpus
var data = fs.readFileSync(brownCorpusFile, 'utf8');
var corpus = new Corpus(data, BROWN);
var trainAndTestCorpus = corpus.splitInTrainAndTest(50);
var trainCorpus = trainAndTestCorpus[0];
var testCorpus = trainAndTestCorpus[0];

// Prepare sample, features, classes
generateFeaturesAndSampleFromCorpus(trainCorpus);
console.log("Number of features: " + features.length);
trainCorpus.analyse();
classes = Object.keys(trainCorpus.posTags);
console.log("Number of classes: " + classes.length);

// Train the classifier
var classifier = new Classifier(classes, features, sample);
classifier.train(100, 0.001);
console.log("Checksum: " + classifier.p.checkSum());

// Test the classifier against the test corpus
lexicon = trainCorpus.buildLexicon();
var tagger = new Tagger(lexicon);
applyClassifierToTestCorpus();
