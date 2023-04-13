const {transformFileSync, t} = require('@babel/core')
const path = require("path");
const myPlugin = require('../dist/index.js')
const fs = require("fs");

const file = path.resolve(__dirname, '__fixtures__/import', 'input.js')

const result =  transformFileSync(file, {plugins: [myPlugin]});

const outputPath = path.resolve(__dirname, '__fixtures__/import/output.js')

fs.writeFileSync(outputPath, result.code);
