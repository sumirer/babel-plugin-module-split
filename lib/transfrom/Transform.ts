import * as babel from '@babel/core';
import { NodePath } from '@babel/core';
import { PluginContext } from '../ctx/PluginContext';
// @ts-ignore
import fs from 'fs';
import { getAbsolutePath, getPath } from '../utils';

const t = babel.types;

export type Declarations = {
  exports: (
    | babel.types.ExportDeclaration
    | babel.types.ExportAllDeclaration
    | babel.types.ExportNamedDeclaration
  )[];
  imports: babel.types.ImportDeclaration[];
};

export function transformImportDeclaration(
  this: PluginContext,
  path: NodePath<babel.types.ImportDeclaration>,
  state: PluginContext
) {
  const config = state.__pluginConfig;
  const importSource = path.node.source.value;
  const getConfig = config.getMatchModule(state.filename, importSource);
  if (getConfig) {
    const specifiers = path.node.specifiers;
    if (specifiers.length === 0) {
      return;
    }
    let findImport: Array<{ target: string; alias: string; importSourcePath: string }> = [];
    for (let index = 0; index < specifiers.length; index++) {
      const specifier = specifiers[index];
      if (t.isImportDefaultSpecifier(specifier) || t.isImportNamespaceSpecifier(specifier)) {
        return;
      }
      if (t.isImportSpecifier(specifier)) {
        const imported = specifier.imported;
        findImport.push({
          target: t.isStringLiteral(imported) ? imported.value : imported.name,
          alias: specifier.local.name,
          importSourcePath: importSource,
        });
      }
    }
    const targetModulePath = getModuleFile(getConfig.modulePath!, getConfig.ext);
    // get target file import
    let declarationData: Declarations;
    if (state.__moduleCache.has(targetModulePath)) {
      declarationData = state.__moduleCache.get(targetModulePath) as Declarations;
    } else {
      declarationData = getModuleImport(config.babelInstance, targetModulePath);
    }
    findImport = duplicate<{ target: string; alias: string; importSourcePath: string }>(findImport);
    path.replaceWithMultiple(
      findImport
        .map((ip) => {
          const getRawImport = getTargetExportPathNode(
            ip.target,
            ip.alias,
            ip.importSourcePath,
            config.alias,
            declarationData
          );
          return getRawImport!;
        })
        .filter(Boolean)
    );
  }
}

function getModuleImport(babelInstance: typeof babel, modulePath: string): Declarations {
  const fileContent = fs.readFileSync(modulePath);
  const result = babelInstance.parseSync(fileContent.toString());
  const declarations: Declarations = {
    exports: [],
    imports: [],
  };
  const target = result?.program.body || [];
  for (let index = 0; index < target.length; index++) {
    const _statement = target[index];
    if (t.isImportDeclaration(_statement)) {
      declarations.imports.push(_statement);
    } else if (
      t.isExportDeclaration(_statement) ||
      t.isExportNamedDeclaration(_statement) ||
      t.isExportAllDeclaration(_statement)
    ) {
      declarations.exports.push(_statement);
    }
  }
  return declarations;
}

function getModuleFile(modulePath: string, ext: string): string {
  if (fs.existsSync(modulePath + ext)) {
    return modulePath + ext;
  }
  return modulePath + '/index' + ext;
}

function duplicate<T extends {}>(list: Array<T>): Array<T> {
  if (list.length < 1) {
    return list;
  }
  const keyCreate = (keys: Array<keyof T>, obj: T) => {
    let key = '';
    keys.forEach((item) => {
      key += obj[item];
    });
    return key;
  };
  const hashRecord: Record<string, T> = {};
  const first = list[0];
  const hashKey = Object.keys(first) as Array<keyof T>;
  for (let index = 0; index < list.length; index++) {
    hashRecord[keyCreate(hashKey, list[index])] = list[index];
  }
  return Object.values(hashRecord);
}

function getTargetExportPathNode(
  moduleName: string,
  alias: string,
  importSourcePath: string,
  aliasRecord: Record<string, any>,
  { exports, imports }: Declarations
): babel.types.ImportDeclaration | undefined {
  for (let index = 0; index < exports.length; index++) {
    const item = exports[index];
    if (t.isExportNamedDeclaration(item)) {
      const exportSpecifier = item.specifiers.find(
        (_item) =>
          (t.isExportSpecifier(_item) || t.isExportNamespaceSpecifier(_item)) &&
          (t.isStringLiteral(_item.exported) ? _item.exported.value : _item.exported.name) ===
            moduleName
      );
      if (exportSpecifier) {
        let targetImportStatement:
          | babel.types.ImportSpecifier
          | babel.types.ImportNamespaceSpecifier
          | babel.types.ImportDefaultSpecifier
          | undefined;
        // export {TestMode, Test as TestA}
        if (!item.source) {
          let findImportStatement:
            | babel.types.ImportSpecifier
            | babel.types.ImportNamespaceSpecifier
            | babel.types.ImportDefaultSpecifier
            | undefined;
          const findImport = imports.find((importStatement) => {
            findImportStatement = importStatement.specifiers.find((value) => {
              return (
                value.local.name ===
                (t.isStringLiteral(exportSpecifier.exported)
                  ? exportSpecifier.exported.value
                  : exportSpecifier.exported.name)
              );
            });
            return findImportStatement;
          });

          if (findImport && findImportStatement) {
            const targetImportSource = getImportPath(
              aliasRecord,
              findImport.source.value,
              importSourcePath
            );
            // target: import Test from './test'
            // out import: import {Test} from './utils'
            // result: import Test from './utils/test'
            if (t.isImportDefaultSpecifier(findImportStatement)) {
              targetImportStatement = t.importDefaultSpecifier(t.identifier(alias));
            } else {
              targetImportStatement = t.importSpecifier(
                t.identifier(alias),
                t.cloneNode(findImportStatement.local)
              );
            }
            if (targetImportStatement)
              return t.importDeclaration(
                [targetImportStatement],
                t.stringLiteral(targetImportSource)
              );
          }
        }
        const rowImportTarget = item.source?.value || '';
        const targetImportSource = getImportPath(aliasRecord, rowImportTarget, importSourcePath);
        // export * as Test from './Test';
        if (t.isExportNamespaceSpecifier(exportSpecifier)) {
          targetImportStatement = t.importNamespaceSpecifier(t.identifier(alias));
        }

        // export  {default as Test5} from './Test1';
        if (t.isExportSpecifier(exportSpecifier)) {
          targetImportStatement = t.importSpecifier(
            t.identifier(alias),
            t.cloneNode(exportSpecifier.local)
          );
        }
        if (targetImportStatement) {
          return t.importDeclaration([targetImportStatement], t.stringLiteral(targetImportSource));
        }
      }
    }
  }
}

function isNodeModule(module: string): boolean {
  return !module.startsWith('.');
}

function getImportPath(
  aliasRecord: Record<string, string>,
  path: string,
  importSourcePath: string
) {
  return getPath(aliasRecord, path) === path && isNodeModule(path)
    ? path
    : getAbsolutePath(importSourcePath, getPath(aliasRecord, path));
}
