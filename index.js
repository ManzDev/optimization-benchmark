const fs = require('fs');
const process = require('process');
const child = require('child_process');

const filesize = file => {
  return fs.existsSync(file) ? fs.statSync(file).size : 0;
};

const exec = (name, command, input, output) => {
  if (fs.existsSync(output))
    fs.unlinkSync(output);
  const start = process.hrtime();
  try {
    child.execSync(command.replace('$FILE', input));
  }
  catch (err) {
    console.log(err);
  }
  const end = process.hrtime(start);
  const size = filesize(output);
  return {
    name: name,
    size: size,
    time: end[0] + (end[1] / 1000000000)
  }
};

const runtest = (jsonfile, test) => {
  let results = [];
  let id = 0;

  if (test != undefined)
    tests = tests.filter(e => e.name == test);

  files.forEach(testfile => {
    const originalSize = filesize(`datasets/${testfile}`);
    tests.forEach(e => {
      let o;
      try {
        o = exec(e.name, e.cmd, `datasets/${testfile}`, e.output || 'data.txt');
      }
      catch (err) {
        console.log('ERROR');
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

  if (test != undefined) {
    // let contents = fs.readFileSync(`build/json/${jsonfile}`);
    // let oldresults = JSON.parse(contents);
    // console.log(oldresults);
    // oldresults.filter(e => e.name != test);
    // results = [ ...oldresults, ...results ];
  }
  fs.writeFileSync(`build/json/${jsonfile}`, JSON.stringify(results));
};

const param = process.argv[2];

if (param === undefined)
  console.log(`Sintaxis:\n\n node index.js --all\n node index.js --png\n node index.js --css`)

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

if ((param === '--all') || (param === '--css'))
  runtest('css-benchmark.json');

files = [ 'google.html', 'amazon.html', 'twitter.html', 'youtube.html'];
tests = [
  { name: 'html-minifier', level: 'normal', cmd: 'npx html-minifier $FILE -o data.txt' },
  { name: 'html-minifier', level: 'agressive', cmd: 'npx html-minifier --remove-comments --remove-attribute-quotes --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --use-short-doctype $FILE -o data.txt' },  
  { name: 'htmlnano', level: 'normal', cmd: 'node htmlnano-cli.js $FILE data.txt' },
  { name: 'htmlnano', level: 'agressive', cmd: 'node htmlnano-cli.js $FILE data.txt --agressive' },
];

if ((param === '--all') || (param === '--html'))
  runtest('html-benchmark.json');

files = [ 'lodash.js', 'react.dev.js', 'vue.js', 'moment.js'];
tests = [
  { name: 'uglify-js', level: 'normal', cmd: 'npx uglify-js --compress -o data.txt $FILE' },
  { name: 'uglify-js', level: 'with babel', cmd: 'npx babel --presets=env $FILE | npx uglify-js --compress -o data.txt' },
  { name: 'terser', level: 'normal', cmd: 'npx terser --compress -o data.txt $FILE' },
  { name: 'terser', level: 'with babel', cmd: 'npx babel --presets=env $FILE | npx terser --compress -o data.txt' },
];

if ((param === '--all') || (param === '--js'))
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
   { name: 'optipng', level: 'default (o2)', cmd: 'node copy.js $FILE data.txt && npx optipng -strip all data.txt' },
   { name: 'optipng', level: 'fast (o0)', cmd: 'node copy.js $FILE data.txt && npx optipng -o0 -strip all data.txt' },
   { name: 'optipng', level: 'slow (o7)', cmd: 'node copy.js $FILE data.txt && npx optipng -o7 -strip all data.txt' },
   { name: 'pngcrush', level: 'default', cmd: 'npx pngcrush $FILE data.txt' },
   { name: 'pngcrush', level: 'brute force', cmd: 'npx pngcrush -brute $FILE data.txt' },
   { name: 'pngrewrite', level: 'default', cmd: 'pngrewrite $FILE data.txt' },
   { name: 'pngout', level: 'default', cmd: 'npx pngout $FILE data.txt', output: 'data.txt.png' },
   { name: 'pngout', level: 'xtreme', cmd: 'npx pngout /s0 $FILE data.txt', output: 'data.txt.png' },
   { name: 'upng', level: 'normal', cmd: 'npx imagemin --plugin=upng $FILE >data.txt' },
   { name: 'ect', level: 'level 1', cmd: 'node copy.js $FILE data.txt && npx ect -1 -s data.txt' },
   { name: 'ect', level: 'level 9', cmd: 'node copy.js $FILE data.txt && npx ect -9 -s data.txt' },
   { name: 'oxipng', level: 'default', cmd: 'oxipng --opt 0 --out data.txt --strip all $FILE' },
   { name: 'pingo', level: 's0', cmd: 'node copy.js $FILE data.txt && pingo -s0 data.txt' },
   { name: 'pngoptimizercl', level: 'default', cmd: 'node copy.js $FILE data.txt && pngoptimizercl -file:data.txt' },
   { name: 'pngwolf', level: 'default', cmd: 'pngwolf --in=$FILE --out=data.txt' },
   { name: 'truepng', level: 'default', cmd: 'node copy.js $FILE data.png && truepng data.png', output: 'data.png' },
   { name: 'truepng', level: 'o4', cmd: 'node copy.js $FILE data.png && truepng data.png /o4', output: 'data.png' },   
   { name: 'zopflipng', level: 'normal', cmd: 'npx zopflipng $FILE data.txt' },
];

if ((param === '--all') || (param === '--png'))
  runtest('png-benchmark.json', process.argv[3]);

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

if ((param === '--all') || (param === '--jpg'))
  runtest('jpg-benchmark.json');

files = [ 'awesome-tiger.svg', 'city-landscape.svg', 'road.svg' ];
tests = [
   { name: 'svgo', level: 'pretty', cmd: 'npx svgo $FILE --pretty -o data.txt' },
   { name: 'svgo', level: 'default', cmd: 'npx svgo $FILE -o data.txt' },
   { name: 'svgo', level: 'multipass', cmd: 'npx svgo $FILE --multipass -o data.txt' },
   { name: 'svg-cleaner', level: 'default', cmd: 'npx svg-cleaner $FILE data.txt' },
];

if ((param === '--all') || (param === '--svg'))
  runtest('svg-benchmark.json');

files = [ 'gestation.wav' ];
tests = [
   { name: 'mp3', level: 'libmp3lame', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -acodec libmp3lame -ab 1400K data.mp3', output: 'data.mp3' },
   { name: 'mp3', level: 'libshine', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -acodec libshine -ab 1400K data.mp3', output: 'data.mp3' },
   { name: 'aac', level: 'aac', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -ab 1400K data.aac', output: 'data.aac' },
   { name: 'flac', level: 'normal', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -ab 1400K data.flac', output: 'data.flac' },
   { name: 'wavpack', level: 'wavpack', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -acodec wavpack -strict -2 -ab 1400K data.wv', output: 'data.wv' },
   { name: 'wavpack', level: 'libwavpack', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -acodec libwavpack -strict -2 -ab 1400K data.wv', output: 'data.wv' },
   { name: 'opus', level: 'opus', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -acodec opus -strict -2 -ab 1400K data.opus', output: 'data.opus' },
   { name: 'opus', level: 'libopus', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -acodec libopus -ab 1400K data.opus', output: 'data.opus' },
   { name: 'ogg vorbis', level: 'vorbis', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -acodec vorbis -strict -2 -ab 1400K data.ogg', output: 'data.ogg' },
   { name: 'ogg vorbis', level: 'libvorbis', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -acodec libvorbis -ab 1400K data.ogg', output: 'data.ogg' },
   { name: 'ogg speex', level: 'libspeex', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -acodec libspeex -ab 1400K data.ogg', output: 'data.ogg' },
   { name: 'wma', level: 'wmav2', cmd: 'ffmpeg -hide_banner -loglevel error -i $FILE -acodec wmav2 -ab 1400K data.wma', output: 'data.wma' },
];

if ((param === '--all') || (param === '--audio'))
  runtest('audio-benchmark.json');

files = [ 'odisea.avi' ];
tests = [
    { name: 'dirac', level: 'vc2', cmd: 'ffmpeg -hide_banner -loglevel warning -i $FILE -vcodec vc2 -vb 216000K -an data.mkv', output: 'data.mkv' },
    { name: 'sorenson spark', level: 'flv1', cmd: 'ffmpeg -hide_banner -loglevel warning -i $FILE -vcodec flv -vb 216000K -an data.flv', output: 'data.flv' },
    { name: 'h264', level: 'libx264', cmd: 'ffmpeg -hide_banner -loglevel warning -i $FILE -vcodec libx264 -vb 216000K -an data.mp4', output: 'data.mp4' },
    { name: 'hevc', level: 'libx265', cmd: 'ffmpeg -hide_banner -loglevel warning -i $FILE -vcodec libx265 -vb 216000K -an data.mp4', output: 'data.mp4' },
    { name: 'theora', level: 'libtheora', cmd: 'ffmpeg -hide_banner -loglevel warning -i $FILE -vcodec libtheora -vb 216000K -an data.ogg', output: 'data.ogg' },
    { name: 'webm', level: 'libvpx (vp8)', cmd: 'ffmpeg -hide_banner -loglevel warning -i $FILE -vcodec libvpx -vb 216000K -an data.webm', output: 'data.webm' },
    { name: 'webm', level: 'libvpx-vp9 (vp9)', cmd: 'ffmpeg -hide_banner -loglevel warning -i $FILE -vcodec libvpx-vp9 -vb 216000K -an data.webm', output: 'data.webm' },
    { name: 'xvid', level: 'libxvid', cmd: 'ffmpeg -hide_banner -loglevel warning -i $FILE -vcodec libxvid -vb 216000K -an data.avi', output: 'data.avi' },
    //{ name: 'av1', level: 'libaom-av1', cmd: 'ffmpeg -hide_banner -loglevel warning -i $FILE -vcodec libaom-av1 -vb 216000K -an -strict -2 data.webm', output: 'data.webm' },    
];

if ((param === '--all') || (param === '--video'))
  runtest('video-benchmark.json');