/**
 * @devsync/shared-config
 * Root entry — re-exports the most common config presets.
 */
module.exports = {
  eslint: {
    base: require('./eslint/base'),
    next: require('./eslint/next'),
    node: require('./eslint/node'),
  },
  prettier: require('./prettier/index'),
};
