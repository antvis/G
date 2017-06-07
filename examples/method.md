# methodtest

---
method test
---


```js
let count = 2000000;
let Util = require('@ali/g-util');


var obj = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6
};

function A() {
  
}

let t = performance.now();

for (let i = 0; i < count; i++) {
  let obj = {};
}

console.log('plan object', performance.now() - t);

t = performance.now();

for (let i = 0; i < count; i++) {
  let obj = new A();
}

console.log('new object', performance.now() - t);

t = performance.now();

for (let i = 0; i < count; i++) {
  let obj = Object.create(null);
}

console.log('create object', performance.now() - t);


/*
for(let i = 0; i < count; i++) {
  Util.each(obj, function(v, k) {
    
  });
}

console.log('util for each', performance.now() - t);

t = performance.now();
for(let i = 0; i < count; i++) {
  let keys = Object.keys(obj);
  for(let k in keys) {
    let v = obj[k];
  }
}

console.log('keys for each',performance.now() - t);

var arr = [];
for(let i = 0; i < count; i++) {
  arr.push({
    x: 1,
    y: 1
  });
}

t = performance.now();

arr.forEach(function(v, k) {
  
})

console.log('arr forEach',performance.now() - t);

t = performance.now();

for(let i = 0; i < arr.length; i++) {
  
}

console.log('arr for',performance.now() - t);

t = performance.now();

for(let i = 0; i < count; i++) {
  
}

console.log('arr for len',performance.now() - t);



t = performance.now();
var arr = [];
for(let i = 0; i < count; i++) {
  arr.push({
    x: 1,
    y: 1
  });
}

console.log(performance.now() - t);


t = performance.now();
var arr = [];
for(let i = 0; i < count; i++) {
  arr[i] = {
    x: 1,
    y: 1
  };
}

console.log(performance.now() - t);

var s = "lssssssdf";
var regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;

var litter = /^l\s*\(/i;

function a() {
  return regexLG.test(s);
}

function b() {
  return litter.test(s);
}

function c() {
  return s[0] == 'l' && s[1] == '(';
}

t = performance.now();
for(let i = 0; i < count; i++) {
  a();
}
console.log(performance.now() - t);


t = performance.now();
for(let i = 0; i < count; i++) {
  b();
}
console.log(performance.now() - t);

t = performance.now();
for(let i = 0; i < count; i++) {
  c();
}
console.log(performance.now() - t);

*/


```