/**
 * get module path
 * @param filePath
 * @param relativePath
 */
export function getAbsolutePath(filePath: string, relativePath: string): string {
  const path = filePath.split(/\//);
  const rPath = relativePath.split(/\//);
  if (/\.(.*)$/.test(path[path.length - 1])) {
    path.pop();
  }
  rPath.forEach((p) => {
    switch (p) {
      case '..':
        path.pop();
        break;
      case '.':
        break;
      default:
        path.push(p);
    }
  });
  return path.join('/');
}

/**
 * parse alias file path
 * @param alias
 * @param moduleName
 */
export function getPath(alias: Record<string, string>, moduleName: string): string {
  const keys = Object.keys(alias);
  const findMatchAlias = keys.find((start) => moduleName.startsWith(start));
  if (findMatchAlias) {
    return moduleName.replace(findMatchAlias, alias[findMatchAlias]);
  }
  return moduleName;
}
