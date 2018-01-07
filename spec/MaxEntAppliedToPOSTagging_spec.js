
var fs = require('fs');

var base_folder_test_data = './spec/data/';
var brownCorpusFile = base_folder_test_data + 'browntag_nolines_excerpt.txt';

var Corpus = require('../lib/POS/Corpus');
var POS_Element = require('../lib/POS/POS_Element');
var Sample = require('../lib/Sample');
var Classifier = require('../lib/Classifier');
var Feature = require('../lib/Feature');
var FeatureSet = require('../lib/FeatureSet');
var Context = require('../lib/Context');

var Tagger = require('../lib/POS/POS_Tagger');

var BROWN = 1;
var nrIterations = 10;
var minImprovement = 0.01;

var classes = [];
var contexts = [];
var lexicon = null;
var tagger = null;

// Structure of the event space
// - Classes are possible tags
// - A context consists of a window of words and a window of tags

function applyClassifierToTestCorpus(lexicon) {
  var totalWords = 0;
  var correctyTaggedLexicon = 0;
  var correctlyTaggedMaxEnt = 0;
  testCorpus.sentences.forEach(function(sentence){
    // Put the words of the sentence in an array
    var s = sentence.taggedWords.map(function(token) {
      return token.token;
    });

    // Use the lexicon to tag the sentence
    var taggedSentence = tagger.tagWithLexicon(s);
    // Count the right tags
    sentence.taggedWords.forEach(function(token, i) {
      totalWords++;
      if (token.tag === taggedSentence[i][1]) {
        correctyTaggedLexicon++;
      }
    });

    // Classify tags using maxent
    taggedSentence.forEach(function(taggedWord, index) {

      // Create context for classication
      var context = new Context({
          wordWindow: {},
          tagWindow: {}
      });
      // Current wordWindow
      context.data.wordWindow["0"] = taggedWord[0];
      // Previous bigram
      if (index > 1) {
        context.data.tagWindow["-2"] = taggedSentence[index - 2][1];
        //context.data.tagWindow["-1"] = taggedSentence[index - 1][1];
      }
      // Left bigram
      if (index > 0) {
        context.data.tagWindow["-1"] = taggedSentence[index - 1][1];
        //context.data.tagWindow["0"] = taggedSentence[index][1];
      }
      // Right bigram
      if (index < sentence.length - 1) {
        //context.data.tagWindow["0"] = taggedSentence[index][1];
        context.data.tagWindow["1"] = taggedSentence[index + 1][1];
      }
      // Next bigram
      if (index < sentence.length - 2) {
        //context.data.tagWindow["1"] = taggedSentence[index + 1][1];
        context.data.tagWindow["2"] = taggedSentence[index + 2][1];
      }
      // Left bigram words
      if (index > 0) {
        context.data.wordWindow["-1"] = taggedSentence[index - 1][0];
        //context.data.wordWindow["0"] = taggedSentence[index][0];
      }
      // Right bigram words
      if (index < sentence.length - 1) {
        //context.data.wordWindow["0"] = taggedSentence[index][0];
        context.data.wordWindow["1"] = taggedSentence[index + 1][0];
      }

      // Classify
      var tag = classifier.classify(context);
      if (tag === "") {
        tag = lexicon.tagWordWithDefaults(taggedWord[0]);
      }

      // Collect stats
      if (tag === sentence.taggedWords[index].tag) {
        // Correctly tagged
        correctlyTaggedMaxEnt++;
      }
      console.log("(word, classification, right tag): " + "(" + taggedWord[0] +
        ", " + tag + ", " + sentence.taggedWords[index].tag + ")");
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
var testCorpus = trainAndTestCorpus[1];
var classifier = null;

// Generate sample from trainCorpus
var sample = trainCorpus.generateSample();
sample.save('sample.json', function(err, sample) {

  sample.load('sample.json', function(err, sample) {
    /*
    console.log(JSON.stringify(sample, null, 2));
    console.log(sample.size());
    console.log(sample.elements[0].toString());
    console.log(sample.elements[0].b.toString());
  });
  */

    // Generate features from trainCorpus
    var featureSet = new FeatureSet();
    sample.generateFeatures(featureSet);
    console.log(featureSet.prettyPrint());

    console.log("Number of features: " + featureSet.size());
    trainCorpus.analyse();
    classes = Object.keys(trainCorpus.posTags);
    console.log("Number of classes: " + classes.length);

    // Train the classifier
    classifier = new Classifier(classes, featureSet, sample);
    console.log("Classifier created");
    classifier.train(nrIterations, minImprovement);
    console.log("Checksum: " + classifier.p.checkSum());

    // Save the classifier
    classifier.save('classifier.json', function(err, c) {
      if (err) {
        console.log(err);
      }

      // Test the classifier against the test corpus
      lexicon = trainCorpus.buildLexicon();
      //lexicon.setDefaultCategories('NN', 'NP');
      tagger = new Tagger(lexicon);
      applyClassifierToTestCorpus(lexicon);
    });
  }, POS_Element);
});
