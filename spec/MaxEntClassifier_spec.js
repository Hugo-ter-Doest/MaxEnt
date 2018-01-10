/*
    Unit test of Classifier
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

var SE_Element = require('../lib/SimpleExample/SE_Element')
var Context = require('../lib/Context');
var Feature = require('../lib/Feature');
var FeatureSet = require('../lib/FeatureSet');
var Sample = require('../lib/Sample');
var Scaler = require('../lib/GISScaler');
var Classifier = require('../lib/Classifier');

var classifierFilename = "classifier.json";

// Set up a sample
var sample = new Sample();
sample.addElement(new SE_Element("x", new Context("0")));
sample.addElement(new SE_Element("x", new Context("0")));
sample.addElement(new SE_Element("x", new Context("0")));
sample.addElement(new SE_Element("y", new Context("0")));
sample.addElement(new SE_Element("y", new Context("0")));
sample.addElement(new SE_Element("y", new Context("0")));
sample.addElement(new SE_Element("x", new Context("1")));
sample.addElement(new SE_Element("x", new Context("1")));
sample.addElement(new SE_Element("y", new Context("1")));
sample.addElement(new SE_Element("y", new Context("1")));
console.log(sample);

var featureSet = new FeatureSet();
sample.generateFeatures(featureSet);

// Create a classifier
var classes = ["x", "y"];
var classifier = new Classifier(classes, featureSet, sample);

// Traing the classifier
classifier.train(20, 0.1);

// Classify
console.log("Classes plus scores " + JSON.stringify(classifier.getClassifications(0)));
console.log("Class is " + classifier.classify(0));

// Inspect the distribution
classifier.p.checkSum();
console.log("Distribution: " + JSON.stringify(classifier.p, null, 2));
console.log("Distribution log likelihood: " + classifier.p.logLikelihood(sample));


sample.elements.forEach(function(x) {
  console.log("Correction feature applied to " + x.toString() + " gives " + featureSet.getFeatures()[1].apply(x));
});

classifier.save(classifierFilename, function(err, c) {
  if (err) {
    console.log(err);
  }
  else {
    console.log("Classifier saved to "  + classifierFilename);
  }
});

classifier.load(classifierFilename, SE_Element, function(err, c) {
  if (err) {
    console.log(err);
  }
  else {
    console.log("Classifier loaded from " + classifierFilename);
  }
});

// Classify
var context = new Context('0');
console.log("Classes plus scores " + JSON.stringify(classifier.getClassifications(context)));
var classification = classifier.classify(context);
if (classification === "") {
  console.log("Could not be classified");
}
else {
  console.log("Classified as: " + classification);
}
