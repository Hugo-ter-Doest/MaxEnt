/*
    Sample space of observed events
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

function Sample(elements) {
  if (elements) {
    this.elements = elements;
    this.analyse();
  }
}

Sample.prototype.analyse = function() {
  this.frequency = {};
  this.frequencyOfContext = {};
  var that = this;
  this.elements.forEach(function(x) {
    if (!that.frequencyOfContext[x.b.toString()]) {
      that.frequencyOfContext[x.b.toString()] = 0;
    }
    that.frequencyOfContext[x.b.toString()]++;
    if (!that.frequency[x.toString()]) {
      that.frequency[x.toString()] = 0;
    }
    that.frequency[x.toString()]++;
  });
};

Sample.prototype.addElement = function(x) {
  this.elements.push(x);
  // Update frequencies
  if (!this.frequencyOfContext[x.b.toString()]) {
    this.frequencyOfContext[x.b.toString()] = 0;
  }
  this.frequencyOfContext[x.b.toString()]++;
  if (!this.frequency[x.toString()]) {
    this.frequency[x.toString()] = 0;
  }
  this.frequency[x.toString()]++;
};

Sample.prototype.observedProbabilityOfContext = function(context) {
  if (this.frequencyOfContext[context.toString()]) {
    return this.frequencyOfContext[context.toString()] / this.elements.length;
  }
  else {
    return 0;
  }
};

Sample.prototype.observedProbability = function(x) {
  if (this.frequency[x.toString()]) {
    return this.frequency[x.toString()] / this.elements.length;
  }
  else {
    return 0;
  }
};

Sample.prototype.size = function() {
  return this.elements.length;
};

Sample.prototype.generateFeatures = function() {
  var features = [];
  this.elements.forEach(function(x) {
    features = x.generateFeatures(features);
  });
  return features;
};

Sample.prototype.save = function(filename, callback) {
  var sample = this;
  var data = JSON.stringify(this, null, 2);
  fs.writeFile(filename, data, 'utf8', function(err) {
      console.log('Sample written')
      if(callback) {
          callback(err, err ? null : sample);
      }
  });
};

Sample.prototype.load = function(filename, callback) {
  fs.readFile(filename, 'utf8', function(err, data) {
    var sample = null;

    if(!err) {
        sample = JSON.parse(data);
        if (!sample.frequency || !sample.frequencyOfContext) {
          sample.analyse();
        }
        if (callback) {
          callback(err, sample);
        }
    }

    if(callback)
        callback(err);
  });
};


module.exports = Sample;
