const path = require('path');
const glob = require('glob-to-regexp');
const blacklist = require('metro/src/blacklist');
const pkg = require('../package.json');

const dependencies = Object.keys(pkg.dependencies);
const devDependencies = Object.keys(pkg.devDependencies);

module.exports = {
  getProjectRoots() {
    return [__dirname, path.resolve(__dirname, '..')];
  },
  getProvidesModuleNodeModules() {
    return [...dependencies, ...devDependencies];
  },
  getBlacklistRE() {
    return blacklist([glob(`${path.resolve(__dirname, '..')}/node_modules/*`)]);
  },
};
