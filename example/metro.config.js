const path = require('path');
const glob = require('glob-to-regexp');
const blacklist = require('metro-config/src/defaults/blacklist');
const pkg = require('../package.json');

const dependencies = Object.keys(pkg.dependencies);
const devDependencies = Object.keys(pkg.devDependencies);

module.exports = {
  watchFolders: [
    path.resolve(__dirname, '../')
  ],
  resolver: {
    blacklistRE: blacklist([glob(`${path.resolve(__dirname, '..')}/node_modules/*`)]),
    providesModuleNodeModules: [...dependencies, ...devDependencies]
  },
};

