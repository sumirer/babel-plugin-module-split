import { transformImportDeclaration } from './transfrom/Transform';
import * as babel from '@babel/core';
import { PluginContext } from './ctx/PluginContext';
import { PluginConfig } from './config/PluginConfig';

export default function (babelInstance: typeof babel): babel.PluginObj<PluginContext> {
  return {
    pre(this: PluginContext) {
      this.__moduleCache = new Map();
      this.__pluginConfig = new PluginConfig(
        this.opts.modules || [],
        this.opts.alias || {},
        this.cwd,
        babelInstance
      );
    },
    visitor: {
      ImportDeclaration: transformImportDeclaration,
    },
  };
}
