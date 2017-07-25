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

function Sample(elements) {
  this.elements = elements;

  var that = this;
  this.frequency = {};
  this.frequencyOfContext = {};
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
}

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

module.exports = Sample;
