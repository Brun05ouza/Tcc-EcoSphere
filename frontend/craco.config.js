module.exports = {
  webpack: {
    configure: (config) => {
      const sourceMapRule = config.module.rules.find(
        (r) => r.enforce === 'pre' && r.loader && String(r.loader).includes('source-map-loader')
      );
      if (sourceMapRule) {
        sourceMapRule.exclude = [/node_modules/, /@babel(?:\/|\\{1,2})runtime/];
      }
      return config;
    },
  },
};
