const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "stream": require.resolve("stream-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "util": require.resolve("util/"),
        "url": require.resolve("url/"),
        "crypto": require.resolve("crypto-browserify"),
        "assert": require.resolve("assert/"),
      };
      return webpackConfig;
    },
  },
};
