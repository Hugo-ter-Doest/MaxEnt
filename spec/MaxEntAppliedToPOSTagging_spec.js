/*
  Test of Classifier based on POS tagging
  Copyright (C) 2018 Hugo W.L. ter Doest

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

var fs = require('fs');

var base_folder_test_data = './spec/data/';
var brownCorpusFile = base_folder_test_data + 'browntag_nolines_excerpt.txt';
var sampleFile = base_folder_test_data + 'sample.json';
var classifierFile = base_folder_test_data + 'classifier.json';

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

// Structure of the event space
// - Classes are possible tags
// - A context consists of a window of words and a window of tags

function applyClassifierToTestCorpus(testCorpus, tagger, classifier) {
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

      // Classify using maximum entropy model
      var tag = classifier.classify(context);

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

describe("Maximum Entropy Classifier applied to POS tagging", function() {
  // Prepare the train and test corpus
  var data = fs.readFileSync(brownCorpusFile, 'utf8');
  var corpus = new Corpus(data, BROWN);
  var trainAndTestCorpus = corpus.splitInTrainAndTest(50);
  var trainCorpus = trainAndTestCorpus[0];
  var testCorpus = trainAndTestCorpus[1];
  var sample = null;
  var classifier = null;
  var featureSet = null;
  var lexicon = null;
  var tagger = null;

  // Generate sample from trainCorpus
  it("generates a sample from a corpus", function() {
    sample = trainCorpus.generateSample();
    expect(sample.size()).toBeGreaterThan(0);
  });

  it("saves a sample to a file", function(done) {
    sample.save('sample.json', function(err, sample) {
      if (err) {
        console.log(err);
        expect(false).toBe(true);
      }
      else {
        console.log("Sample saved to "  + sampleFile);
        expect(fs.existsSync(sampleFile)).toBe(true);
      }
      done();
    });
  });

  it("loads a sample from a file", function(done) {
    sample.load(sampleFile, POS_Element, function(err, newSample) {
      if (err) {
        console.log(err);
        expect(false).toBe(true);
      }
      else {
        console.log("Sample loaded from "  + sampleFile);
        expect(newSample.size()).toBeEqual(sample.size());
        sample = newSample;
      }
      done();
    });
  });

  it ("generates a set of features from the sample", function() {
    featureSet = new FeatureSet();
    sample.generateFeatures(featureSet);
    expect(featureSet.size()).toBeGreaterThan(0);
    console.log("Number of features: " + featureSet.size());
    console.log(featureSet.prettyPrint());
  });

  it("analyses the sample", function() {
    trainCorpus.analyse();
    lexicon = trainCorpus.buildLexicon();
    expect(lexicon.size()).toBeGreaterThan(0);
  });

  it("trains the maximum entropy classifier", function() {
    classifier = new Classifier(featureSet, sample);
    console.log("Classifier created");
    classifier.train(nrIterations, minImprovement);
    console.log("Checksum: " + classifier.p.checkSum());
  });

  it ("saves the classifier to a file", function(done) {
    classifier.save(classifierFile, function(err, classifier) {
      if (err) {
        console.log(err);
        expect(false).toBe(true);
      }
      else {
        console.log("Classifier saved to "  + classifierFile);
        expect(fs.existsSync(classifierFile)).toBe(true);
      }
      done();
    });
  });

/*
  it("loads the classifier from a file", function(done) {
    classifier.load(classifierFile, function(err, newClassifier) {
      if (err) {
        console.log(err);
        expect(false).toBe(true);
      }
      else {
        console.log("Sample loaded from "  + sampleFile);
        classifier = newClassifier;
        expect(classifier.sample.size()).toBeGreaterThan(0);
      }
      done();
    });
  });
  */

  it("compares maximum entropy based POS tagger to lexicon-based tagger", function() {
      // Test the classifier against the test corpus
      //lexicon.setDefaultCategories('NN', 'NP');
      tagger = new Tagger(lexicon);
      applyClassifierToTestCorpus(testCorpus, tagger, classifier);
  });
});
