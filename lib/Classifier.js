/*
    Classifier class that provides functionality for training and
    classification
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

var fs = require('fs');

var Element = require('./Element');
var Scaler = require('./GISScaler');

function Classifier(classes, features, sample) {
  this.classes = classes;
  this.features = [];
  if (features) {
    this.features = features;
  }
  this.features = features;
  this.sample = [];
  if (sample) {
    this.sample = sample;
  }
}

// Loads a classifier from file.
// Caveat: you need to set the feature functions, because these will
// not be saved.
Classifier.prototype.load = function(filename, callback) {
  fs.readFile(filename, 'utf8', function(err, data) {
    var classifier = null;

    if(!err) {
        classifier = JSON.parse(data);
        // Generate feature functions from the sample
        classifier.sample.generateFeatures();
        callback(err, classifier);
    }

    if(callback)
        callback(err);
  });
};

Classifier.prototype.save = function(filename, callback) {
  var data = JSON.stringify(this, null, 2);
  var classifier = this;
  fs.writeFile(filename, data, 'utf8', function(err) {
      if(callback) {
          callback(err, err ? null : classifier);
      }
  });
};

Classifier.prototype.addElement = function(x) {
  this.sample.addElement(x);
};

Classifier.prototype.addDocument = Classifier.prototype.addElement;

Classifier.prototype.addFeature = function(feature) {
  this.features.push(feature);
};

Classifier.prototype.train = function(maxIterations, minImprovement, approxExpectation) {
  this.scaler = new Scaler(this.classes, this.features, this.sample);
  this.p = this.scaler.run(maxIterations, minImprovement, approxExpectation);
};

Classifier.prototype.getClassifications = function(b) {
  var scores = {};
  var that = this;
  this.classes.forEach(function(a) {
    var x = new Element(a, b);
    scores[a] = that.p.calculateAPriori(x);
  });
  console.log('Classification scores: ' + JSON.stringify(scores, null, 2));
  return scores;
};

Classifier.prototype.classify = function(b) {
  var scores = this.getClassifications(b);
  // Sort the scores in an array
  var sortable = [];
  for (var c in scores) {
    sortable.push([c, scores[c]]);
  }
  sortable.sort(function(a, b) {
    return b[1] - a[1];
  });
  // Return the highest scoring classes
  return sortable[0][0];
};

module.exports = Classifier;
