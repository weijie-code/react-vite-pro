// 修改vite源码，支持.less文件的cssmodule，需要配合插件使用

const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

function modifyViteCssPlugin() {
  const file = path.resolve(
    __dirname,
    './node_modules/vite/dist/node/chunks/dep-e0fe87f8.js',
  );
  const content = readFileSync(file, 'utf-8');
  const newContent = content
    .replace(
      'const { modules: modulesOptions, preprocessorOptions }',
      'const { modules: modulesOptions, preprocessorOptions, isModule: checkIsModule }',
    )
    .replace(
      'const isModule = modulesOptions !== false && cssModuleRE.test(id);',
      'const isModule = modulesOptions !== false && (cssModuleRE.test(id) || !!checkIsModule(id));',
    );
  writeFileSync(file, newContent);
}

modifyViteCssPlugin();
