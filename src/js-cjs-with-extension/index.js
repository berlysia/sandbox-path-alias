// We need extension here. Imports field does not resolve to a file without extension
const sub = require("##/sub.js");
const deepSub = require("#deep/sub.js");

console.log("yay js");
sub();
deepSub();
