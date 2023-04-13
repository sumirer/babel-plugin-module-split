import { transformImportDeclaration } from './transfrom/Transform';
import * as babel from '@babel/core';
import { PluginContext } from './ctx/PluginContext';
import { PluginConfig } from './config/PluginConfig';

export default function (babelInstance: typeof babel): babel.PluginObj<PluginContext> {
  return {
    pre(file: babel.BabelFile) {
      this.__moduleCache = new Map();
      this.__pluginConfig = new PluginConfig(
        [
          { match: /\.\/utils$/, root: 'test/__fixtures__/import', ext: '.js' },
          {
            match: /\.\/utils2$/,
            root: 'test/__fixtures__/import',
            ext: '.js'
          },
        ],
        {},
        this.cwd,
        babelInstance
      );
    },
    visitor: {
      ImportDeclaration: transformImportDeclaration,
    },
  };
}
