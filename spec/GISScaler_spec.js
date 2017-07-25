

var Element = require('../lib/Element');
var Feature = require('../lib/Feature');
var Sample = require('../lib/Sample');
var Scaler = require('../lib/GISScaler');

// Set up a sample
var elements = [];
elements.push(new Element("x",0));
elements.push(new Element("y",0));
elements.push(new Element("x",1));
elements.push(new Element("y",1));
var sample = new Sample(elements);
console.log(sample);

// Create a features
var f = new Feature();
f.addMapping(elements[0], 1);
f.addMapping(elements[1], 1);
f.addMapping(elements[2], 0);
f.addMapping(elements[3], 0);
console.log("GISScaler_spec: " + JSON.stringify(f));

// Create a scaler
var contexts = [0, 1];
var classes = ["x", "y"];
var scaler = new Scaler(contexts, classes, [f], sample);

// Run the scaler
var p = scaler.run(100, 1E-69);

// Inspect the distribution
p.checkSum(classes, contexts);
console.log("Distribution: " + JSON.stringify(p));
console.log("Distribution log likelihood: " + p.logLikelihood(sample));
