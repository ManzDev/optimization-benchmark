const fs = require('fs');
const process = require('process');
const child = require('child_process');

const filesize = file => fs.statSync(file).size;

const exec = (name, command, input, output) => {
  if (fs.existsSync(output))
    fs.unlinkSync(output);
  const start = process.hrtime();
  child.execSync(command.replace('$FILE', input));
  const end = process.hrtime(start);
  const size = filesize(output);
  return {
    name: name,
    size: size,
    time: end[0] + (end[1] / 1000000000)
  }
};

const runtest = (jsonfile) => {
  const results = [];
  let id = 0;

  files.forEach(testfile => {
    const originalSize = filesize(`datasets/${testfile}`);
    tests.forEach(e => {
      let o;
      try {
        o = exec(e.name, e.cmd, `datasets/${testfile}`, e.output || 'data.txt');
      }
      catch (err) {
        console.log(err);
        o = {
          size: 'BUG',
          time: 'BUG'
        }
      }
      results.push({
        id: id++,
        name: e.name,
        level: e.level,
        size: o.size + ' / ' + originalSize,
        sizePercent: (100 - ~~((o.size * 100) / originalSize)),
        time: o.time,
        file: testfile      
      });
      console.log(testfile, '\t', e.name, '\t', o.size, '\t', o.time, ' ....done!');
    });  
  });
  fs.writeFileSync(`build/json/${jsonfile}`, JSON.stringify(results));
};

let files = [ 'bootstrap.css', 'fontawesome.css', 'foundation.css', 'material.css'];
let tests = [
  { name: 'cleancss', level: 'normal', cmd: 'npx cleancss $FILE -o data.txt' },
  { name: 'cleancss', level: 'optimize L0', cmd: 'npx cleancss -O0 $FILE -o data.txt' },
  { name: 'cleancss', level: 'optimize L1', cmd: 'npx cleancss -O1 $FILE -o data.txt' },
  { name: 'cleancss', level: 'optimize L2', cmd: 'npx cleancss -O2 $FILE -o data.txt' },  
  { name: 'csso', level: 'normal', cmd: 'npx csso $FILE -o data.txt' },
  { name: 'csso', level: 'w/o restructure', cmd: 'npx csso $FILE --restructure-off -o data.txt' },  
  { name: 'crass', level: 'normal', cmd: 'npx crass $FILE > data.txt' },
  { name: 'crass', level: 'optimize L0', cmd: 'npx crass $FILE --optimize > data.txt' },
  { name: 'crass', level: 'optimize L1', cmd: 'npx crass $FILE -O1 > data.txt' },
  { name: 'cssmin', level: 'normal', cmd: 'npx cssmin $FILE > data.txt' },
  { name: 'cssnano', level: 'normal', cmd: 'npx cssnano $FILE data.txt' },
  { name: 'cssnano', level: 'without adv opt', cmd: 'npx cssnano $FILE data.txt --safe' },
  { name: 'cssshrink', level: 'normal', cmd: 'npx cssshrink $FILE > data.txt' },
  { name: 'csswring', level: 'normal', cmd: 'npx csswring $FILE > data.txt' },  
];

runtest('css-benchmark.json');

files = [ 'google.html', 'amazon.html', 'twitter.html', 'youtube.html'];
tests = [
  { name: 'html-minifier', level: 'normal', cmd: 'npx html-minifier $FILE -o data.txt' },
  { name: 'html-minifier', level: 'agressive', cmd: 'npx html-minifier --remove-comments --remove-attribute-quotes --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --use-short-doctype $FILE -o data.txt' },  
  { name: 'htmlnano', level: 'normal', cmd: 'node htmlnano-cli.js $FILE data.txt' },
  { name: 'htmlnano', level: 'agressive', cmd: 'node htmlnano-cli.js $FILE data.txt --agressive' },
];

runtest('html-benchmark.json');

files = [ 'lodash.js', 'react.dev.js', 'vue.js', 'moment.js'];
tests = [
  { name: 'uglify-js', level: 'normal', cmd: 'npx uglify-js --compress -o data.txt $FILE' },
  { name: 'uglify-js', level: 'with babel', cmd: 'npx babel --presets=env $FILE | npx uglify-js --compress -o data.txt' },
  { name: 'terser', level: 'normal', cmd: 'npx terser --compress -o data.txt $FILE' },
  { name: 'terser', level: 'with babel', cmd: 'npx babel --presets=env $FILE | npx terser --compress -o data.txt' },
];

runtest('js-benchmark.json');

files = [ 'screenshot.png', 'tiger.png', 'chrome.png'];
tests = [
   { name: 'pngquant', level: 'default', cmd: 'npx pngquant $FILE -o data.txt' },
   { name: 'pngquant', level: 'fast', cmd: 'npx pngquant --speed 11 $FILE -o data.txt' },
   { name: 'pngquant', level: 'slow', cmd: 'npx pngquant --speed 1 $FILE -o data.txt' },
   { name: 'advpng', level: 'default', cmd: 'node copy.js $FILE data.txt && npx advpng -z data.txt' },
   { name: 'advpng', level: 'fast (zlib)', cmd: 'node copy.js $FILE data.txt && npx advpng -z -1 data.txt' },
   { name: 'advpng', level: 'normal (7z)', cmd: 'node copy.js $FILE data.txt && npx advpng -z -2 data.txt' },
   { name: 'advpng', level: 'extra (7z)', cmd: 'node copy.js $FILE data.txt && npx advpng -z -3 data.txt' },
   { name: 'advpng', level: 'insane (zopfli)', cmd: 'node copy.js $FILE data.txt && npx advpng -z -4 data.txt' },
   { name: 'optipng', level: 'default (o2)', cmd: 'node copy.js $FILE data.txt && npx optipng data.txt' },
   { name: 'optipng', level: 'fast (o0)', cmd: 'node copy.js $FILE data.txt && npx optipng -o0 data.txt' },
   { name: 'optipng', level: 'slow (o7)', cmd: 'node copy.js $FILE data.txt && npx optipng -o7 data.txt' },
   { name: 'pngcrush', level: 'default', cmd: 'npx pngcrush $FILE data.txt' },
   { name: 'pngcrush', level: 'brute force', cmd: 'npx pngcrush -brute $FILE data.txt' },
   { name: 'pngout', level: 'default', cmd: 'npx pngout $FILE data.txt', output: 'data.txt.png' },
   { name: 'pngout', level: 'xtreme', cmd: 'npx pngout /s0 $FILE data.txt', output: 'data.txt.png' },
   { name: 'upng', level: 'normal', cmd: 'npx imagemin --plugin=upng $FILE >data.txt' },
   { name: 'zopfli', level: 'normal', cmd: 'npx imagemin --plugin=zopfli $FILE >data.txt' },
];

runtest('png-benchmark.json');

files = [ 'fallout4.jpg', 'inception.jpg', 'santacruz.jpg'];
let lev = 89;
tests = [
   { name: 'jpeg-recompress', level: 'medium', cmd: 'npx jpeg-recompress $FILE data.txt' },
   { name: 'jpeg-recompress', level: 'veryhigh', cmd: 'npx jpeg-recompress -q veryhigh $FILE data.txt' },
   { name: 'jpeg-recompress', level: 'low', cmd: 'npx jpeg-recompress -q low $FILE data.txt' },
   { name: 'jpeg-recompress', level: 'mpe', cmd: 'npx jpeg-recompress -m mpe $FILE data.txt' },   
   { name: 'jpeg-recompress', level: 'ssim', cmd: 'npx jpeg-recompress -m ssim $FILE data.txt' },
   { name: 'jpeg-recompress', level: 'ms-ssim', cmd: 'npx jpeg-recompress -m ms-ssim $FILE data.txt' },
   { name: 'jpeg-recompress', level: 'smallfry', cmd: 'npx jpeg-recompress -m smallfry $FILE data.txt' },
   { name: 'jpegoptim', level: 'default', cmd: 'node copy.js $FILE data.txt && npx jpegoptim data.txt' },
   { name: 'jpegoptim', level: lev, cmd: `node copy.js $FILE data.txt && npx jpegoptim -m${lev} data.txt` },
   { name: 'jpegtran', level: 'default', cmd: 'node copy.js $FILE data.txt && npx jpegtran -optimize data.txt' },
   { name: 'mozjpeg', level: 'default', cmd: 'npx mozjpeg -outfile data.txt $FILE' },
   { name: 'cwebp', level: 'default', cmd: 'npx cwebp $FILE -o data.txt' },
   { name: 'cwebp', level: lev, cmd: `npx cwebp -q ${lev} $FILE -o data.txt` },
   { name: 'guetzli', level: 'slooow', cmd: 'npx guetzli $FILE data.txt' },   
];

runtest('jpg-benchmark.json');

files = [ 'awesome-tiger.svg', 'city-landscape.svg', 'road.svg' ];
tests = [
   { name: 'svgo', level: 'pretty', cmd: 'npx svgo $FILE --pretty -o data.txt' },
   { name: 'svgo', level: 'default', cmd: 'npx svgo $FILE -o data.txt' },
   { name: 'svgo', level: 'multipass', cmd: 'npx svgo $FILE --multipass -o data.txt' },
   { name: 'svg-cleaner', level: 'default', cmd: 'npx svg-cleaner $FILE data.txt' },
];

runtest('svg-benchmark.json');