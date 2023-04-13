const { transformFileSync, loadOptions } = require('@babel/core');
const path = require('path');
const myPlugin = require('../dist/index.js');
const fs = require('fs');

const file = path.resolve(__dirname, '__fixtures__/import', 'input.js');

const result = transformFileSync(file, {
  plugins: [
    [
      myPlugin,
      {
        modules: [
          { match: /\.\/utils$/, root: 'test/__fixtures__/import', ext: '.js' },
          {
            match: /\.\/utils2$/,
            root: 'test/__fixtures__/import',
            ext: '.js',
          },
        ],
        alias: {},
      },
    ],
  ],
});

const outputPath = path.resolve(__dirname, '__fixtures__/import/output.js');

fs.writeFileSync(outputPath, result.code);
