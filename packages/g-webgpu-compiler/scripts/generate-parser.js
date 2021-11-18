var fs = require('fs');
var path = require('path');
var pegjs = require('pegjs');
var tspegjs = require('ts-pegjs');

fs.readFile(path.join(__dirname, '../src/pegjs/g.pegjs'), (err, data) => {
  if (err) throw err;

  // https://pegjs.org/documentation#using-the-parser
  var parser = pegjs.generate(data.toString(), {
    output: 'source',
    trace: false,
    cache: false,
    plugins: [tspegjs],
    tspegjs: {
      noTslint: false,
    },
  });

  fs.writeFileSync(path.join(__dirname, '../src/pegjs/g.ts'), parser);
});
