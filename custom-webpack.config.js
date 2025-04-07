module.exports = {
  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      util: require.resolve("util/"),
      crypto: require.resolve("crypto-browserify"),
      fs: false,
      net: false,
      tls: false,
      zlib: false,
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      assert: require.resolve("assert/"),
      os: require.resolve("os-browserify/browser"),
      url: require.resolve("url/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
    ],
  },
};
