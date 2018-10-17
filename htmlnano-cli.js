const htmlnano = require('htmlnano');
const fs = require('fs');
const process = require('process');

let options = {
  collapseAttributeWhitespace: true,
  collapseWhitespace: true,
  deduplicateAttributeValues: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeRedundantAttributes: true,
  collapseBooleanAttributes: true,
  mergeStyles: true,
  mergeScripts: true
};

const html = fs.readFileSync(process.argv[2]);

if (process.argv[3] === '--agressive')
    options = {}

htmlnano.process(html, options)
    .then(function (result) {
        fs.writeFileSync(process.argv[3], result.html)
    })
    .catch(function (err) {
        console.error(err);
    });