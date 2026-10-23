const { defineConfig } = require(`@vue/cli-service`);

module.exports = defineConfig({
  publicPath: `/`,
  assetsDir: `static`,
  transpileDependencies: true,
  devServer: {
    port: 4036,
  },
});
