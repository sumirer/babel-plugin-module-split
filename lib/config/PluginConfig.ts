import * as babel from '@babel/core';
import { getAbsolutePath, getPath } from '../utils';
interface IModulesConfig {
  match: RegExp;
  root: string;
  modulePath?: string;
  ext: string;
}

export class PluginConfig {
  /**
   * use plugin config,create rule space
   * @param modules
   * @param alias
   * @param basePath
   * @param babelInstance
   */
  constructor(
    public readonly modules: Array<IModulesConfig>,
    public alias: Record<string, string>,
    public basePath: string,
    public babelInstance: typeof babel
  ) {}

  /**
   * find match module
   * @param path
   * @param fileName
   */
  public getMatchModule(path?: string, fileName?: string): IModulesConfig | undefined {
    const targetPath = getAbsolutePath(path || '', getPath(this.alias, fileName || ''));
    if (fileName) {
      const getConfig = this.modules.find((match) => {
        const path = '.' + targetPath.replace(this.basePath, '');
        return (
          match.match.test(fileName) &&
          path.startsWith(
            this.formatRelativePath(getAbsolutePath(match.root, getPath(this.alias, fileName)))
          )
        );
      });
      if (getConfig) getConfig.modulePath = targetPath;
      return getConfig;
    }
  }

  public formatRelativePath(path: string): string {
    const splitPath = path.split(/\//);
    if (splitPath[0] !== '.' && splitPath[0] !== '..') {
      splitPath.unshift('.');
    }
    return splitPath.join('/');
  }
}
