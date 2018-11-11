/**
 * @author Liu Chaofan
 * @license MIT
 *
 * My first babel plugin which is inspired by
 * https://github.com/liady/babel-plugin-module-rewrite
 *
 */
const { resolve, dirname } = require('path');

function getReplaceFunction({
  replaceFunction,
  esModuleShim = 'default',
  relativePath = 'process.cwd()'
} = {}) {
  const absPath = resolve(eval(relativePath), replaceFunction);
  const replaceContainer = require(absPath);
  if (!replaceContainer) {
    throw new Error('Cannot find replace function file: ' + absPath);
  }
  const replace = replaceContainer[esModuleShim] || replaceContainer;
  if (!replace || typeof replace !== 'function') {
    throw new Error(
      'Cannot find replace handler in: ' +
        absolutePath +
        ' with name: ' +
        replaceHandlerName
    );
  }
  return replace;
}

module.exports = function({ types: t }) {
  let cachedReplaceFunction;

  /**
   *
   * @param {string} source origin require name
   * @param {string|void} file current process filename
   * @param {Object} state current plugin state
   */
  function mapModule(source, file, state) {
    const opts = state.opts;
    if (!cachedReplaceFunction) {
      cachedReplaceFunction = getReplaceFunction(opts);
    }
    const replace = cachedReplaceFunction;
    const result = replace(source, file, opts);
    if (result !== source) {
      return result;
    } else {
      return;
    }
  }

  function transformRequireCall(nodePath, state) {
    /**
     * The If statement blow will allow the CallExpression like require() or require.a().
     */
    if (
      !t.isIdentifier(nodePath.node.callee, { name: 'require' }) &&
      !(
        t.isMemberExpression(nodePath.node.callee) &&
        t.isIdentifier(nodePath.node.callee.object, { name: 'require' })
      )
    ) {
      return;
    }
    const moduleArg = nodePath.node.arguments[0];
    if (moduleArg && moduleArg.type === 'StringLiteral') {
      const modulePath = mapModule(
        moduleArg.value,
        state.file.opts.filename,
        state
      );
      if (modulePath) {
        nodePath.replaceWith(
          t.callExpression(nodePath.node.callee, [t.stringLiteral(modulePath)])
        );
      }
    }
  }

  function transformImportExportCall(nodePath, state) {
    const moduleArg = nodePath.node.source;
    if (moduleArg && moduleArg.type === 'StringLiteral') {
      const modulePath = mapModule(
        moduleArg.value,
        state.file.opts.filename,
        state
      );
      if (modulePath) {
        nodePath.node.source = t.stringLiteral(modulePath);
      }
    }
  }

  return {
    visitor: {
      CallExpression: {
        exit(nodePath, state) {
          return transformRequireCall(nodePath, state);
        }
      },
      ImportDeclaration: {
        exit(nodePath, state) {
          return transformImportExportCall(nodePath, state);
        }
      },
      ExportDeclaration: {
        exit(nodePath, state) {
          return transformImportExportCall(nodePath, state);
        }
      }
    }
  };
};
