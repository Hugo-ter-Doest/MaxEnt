/*
    Unit test of Classifier
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

var Element = require('../lib/Element');
var Context = require('../lib/Context');
var Feature = require('../lib/Feature');
var Sample = require('../lib/Sample');
var Scaler = require('../lib/GISScaler');
var Classifier = require('../lib/Classifier');

// Set up a sample
var elements = [];
elements.push(new Element("x", new Context("0")));
elements.push(new Element("x", new Context("0")));
elements.push(new Element("x", new Context("0")));
elements.push(new Element("y", new Context("0")));
elements.push(new Element("y", new Context("0")));
elements.push(new Element("y", new Context("0")));
elements.push(new Element("x", new Context("1")));
elements.push(new Element("x", new Context("1")));
elements.push(new Element("y", new Context("1")));
elements.push(new Element("y", new Context("1")));
var sample = new Sample(elements);
console.log(sample);

// Create a features
function evaluate(x) {
  if (x.b.data === "0") {
    return 1;
  }
  return 0;
}

var f = new Feature(evaluate);
console.log(evaluate.toString());
var features = [f];

// Create a classifier
var classes = ["x", "y"];
var classifier = new Classifier(classes, features, sample);

// Traing the classifier
classifier.train(200, 0.5);

// Classify
console.log("Classes plus scores " + JSON.stringify(classifier.getClassifications(0)));
console.log("Class is " + classifier.classify(0));

// Inspect the distribution
classifier.p.checkSum();
console.log("Distribution: " + JSON.stringify(classifier.p, null, 2));
console.log("Distribution log likelihood: " + classifier.p.logLikelihood(sample));


sample.elements.forEach(function(x) {
  console.log("correction feature applied to " + x.toString() + " gives " + features[1].apply(x));
});

classifier.save('classifier.json', function(err, c) {
  if (err) {
    console.log(err);
  }
});

classifier.load('classifier.json', function(err, c) {
  if (err) {
    console.log(err);
  }
});

// Classify
console.log("Classes plus scores " + JSON.stringify(classifier.getClassifications(0)));
console.log("Class is " + classifier.classify(0));
