# Maximum Entropy Classifier
This module provides a classifier based on maximum entropy modelling. The central idea to maximum entropy modelling is to estimate a probability distribution that that has maximum entropy subject to the evidence that is available. This means that the distribution follows the data it has "seen" but does not make any assumptions beyond that.

The module is not specific to natural language processing. There are little requirements with regard to the data structure it can be trained on. For training, it needs a sample that consists of elements. These elements have two parts:
* part a: the class of the element
* part b: the context of the element
The classifier will, once trained, return the most probable class for a particular context. Elements and contexts are created as follows:

```javascript
var Element = require('Element');
var Context = require('Context');
var Sample = require('Sample');

var x = new Element("x", new Context("0"));
// A sample is created from an array of elements
var sample = new Sample();
sample.addElement(x);
```
A class is a string, contexts may be as complex as you want (as long as it can be serialised).

A sample can be saved to and loaded from a file:
```javascript
sample.save('sample.json', function(error, sample) {
  ...
});
```


```javascript
sample.load('sample.json', MyElementClass, function(err, sample) {

});
```

## Features
Features are functions that map elements to {0, 1}. Features are defined as follows:
```javascript
var Feature = require('Feature');

function f(x) {
  if (x.b === "0") {
    return 1;
  }
  return 0;
}

var feature = new Feature(f);
```
In most cases you will generate feature functions using closures. For instance, when you generate feature functions in a loop that iterates through an array
```javascript
var Feature = require('Feature');

var listOfTags = ['NN', 'DET', 'PREP', 'ADJ'];
var features = [];

listofTags.forEach(function(tag) {
  function f(x) {
    if (x.b.data.tag === tag) {
      return 1
    }
    return 0;
  }
  feature.push(new Feature(f));
});
```
In this example you create feature functions that each have a different value for <code>tag</code> in their closure.

## Setting up and training the classifier
A classifier needs the following parameter:
* Classes: an array of classes (strings)
* Features: an array of feature functions
* Sample: a sample of elements for training the classifier

A classifier can be created as follows:
```javascript
var Classifier = require('Classifier');
var classifier = new Classifier(classes, features, sample);
```
And it starts training with:
```javascript
var maxIterations = 100;
var minImprovement = .01;
var p = classifier.train(maxIterations, minImprovement);
```
It returns a probability distribution that can be stored and retrieved for later usage:
```javascript
classifier.save('classifier.json', function(err, c) {
  if (err) {
    console.log(err);
  }
  else {
    // Continue using the classifier
  }
});

classifier.load('classifier.json', function(err, c) {
  if (err) {
    console.log(err);
  }
  else {
    // Use the classifier
  }
});
```

The training algorithm is based on Generalised Iterative Scaling.

## Applying the classifier
The classifier can be used to classify contexts in two ways. To get the probabilities for all classes:
```javascript
var classifications = classifier.getClassifications(context);
classifications.forEach(function(class) {
  console.log('Class ' + class + ' has score ' + classifications[class]);
});
```
This returns a map from classes to probabilities.
To get the highest scoring class:
```javascript
var class = classifier.classify(context);
console.log(class);
```

## Application to POS tagging
An example is provided of maximum entropy modelling to POS tagging. The following steps are taken to prepare a corpus for training:
* The corpus is processed to

## References
* Adwait RatnaParkhi, Maximum Entropy Models For Natural Language Ambiguity Resolution, University of Pennsylvania, 1998, URL: http://repository.upenn.edu/cgi/viewcontent.cgi?article=1061&context=ircs_reports
