// vue.config.js
// 路径包
const path = require("path");
// 模块打包器
const webpack = require("webpack");
// 开启gzip压缩， 按需引用
const CompressionWebpackPlugin = require("compression-webpack-plugin");
// 开启gzip压缩， 按需写入
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
// 打包分析
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
// 判断当前运行环境
const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);
console.log(IS_PROD);
const resolve = (dir) => path.join(__dirname, dir);
module.exports = {
  // 公共路径
  publicPath: IS_PROD ? "/" : "/",
  // 相对于打包路径index.html的路径
  indexPath: "index.html",
  // 'dist', 生产环境构建文件的目录
  outputDir: process.env.outputDir || "dist",
  // 相对于outputDir的静态资源(js、css、img、fonts)目录
  assetsDir: "resource",
  // 是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码
  lintOnSave: false,
  // 是否使用包含运行时编译器的 Vue 构建版本
  runtimeCompiler: true,
  // 生产环境的 source map
  productionSourceMap: !IS_PROD,
  // 是否为 Babel 或 TypeScript 使用 thread-loader。该选项在系统的 CPU 有多于一个内核时自动启用，仅作用于生产构建
  parallel: require("os").cpus().length > 1,
  // 向 PWA 插件传递选项
  pwa: {},
  chainWebpack: (config) => {
    // 修复热更新失效
    config.resolve.symlinks(true);
    // 如果使用多页面打包，使用vue inspect --plugins查看html是否在结果数组中
    config.plugin("html").tap((args) => {
      // 修复 Lazy loading routes Error
      args[0].chunksSortMode = "none";
      // 设置项目title
      args[0].title = "";
      return args;
    });
    // 添加别名
    config.resolve.alias
      .set("@", resolve("src"))
      .set("@assets", resolve("src/assets"))
      .set("@images", resolve("src/assets/images"))
      .set("@styles", resolve("src/assets/styles"))
      .set("@components", resolve("src/components"))
      .set("@componentsForestage", resolve("src/components/forestage"))
      .set("@componentsBackstage", resolve("src/components/backstage"))
      .set("@componentsCommon", resolve("src/components/common"))
      .set("@plugins", resolve("src/plugins"))
      .set("@services", resolve("src/services"))
      .set("@layouts", resolve("src/layouts"))
      .set("@store", resolve("src/store"))
      .set("@utils", resolve("src/utils"))
      .set("@views", resolve("src/views"))
      .set("@forestage", resolve("src/views/forestage"))
      .set("@backstage", resolve("src/views/backstage"))
      .set("@layouts", resolve("src/views/layouts"))
      .set("@layoutsForestage", resolve("src/views/layouts/forestage"))
      .set("@layoutsBackstage", resolve("src/views/layouts/backstage"));
    if (IS_PROD) {
      // 压缩图片
      // 需要 npm i -D image-webpack-loader
      // 仅在生产环境下进行压缩处理
      /*config.module
        .rule("images")
        //.test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
        .use("image-webpack-loader")
        .loader("image-webpack-loader")
        .options({ bypassOnDebug: true })
        .end();*/
      /*config.module
        .rule("images")
        .use("image-webpack-loader")
        .loader("image-webpack-loader")
        .options({
          mozjpeg: { progressive: true, quality: 65 },
          optipng: { enabled: false },
          pngquant: { quality: [0.65, 0.9], speed: 4 },
          gifsicle: { interlaced: false },
          webp: { quality: 75 },
        })
        .end();*/
      // 打包分析, 打包之后自动生成一个名叫report.html文件(可忽视)
      config.plugin("webpack-report").use(BundleAnalyzerPlugin, [
        {
          analyzerMode: "static",
        },
      ]);
    }
  },
  configureWebpack: (config) => {
    // 开启 gzip 压缩
    // 需要 npm i -D compression-webpack-plugin
    const plugins = [];
    if (IS_PROD) {
      plugins.push(
        new CompressionWebpackPlugin({
          filename: "[path][base].gz",
          algorithm: "gzip",
          test: productionGzipExtensions,
          threshold: 10240,
          minRatio: 0.8,
        }),
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 5,
        }),
        new webpack.optimize.MinChunkSizePlugin({
          minChunkSize: 100,
        }),
        // Ignore all locale files of moment.js
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
        })
      );
    }
    config.plugins = [...config.plugins, ...plugins];
  },
  css: {
    extract: IS_PROD,
    // 去掉文件名中的 .module
    // requireModuleExtension: false,
    loaderOptions: {
      // 给 less-loader 传递 Less.js 相关选项
      less: {
        //antD需配置
        lessOptions: {
          javascriptEnabled: true,
          modifyVars: {},
        },
      },
      sass: {
        sassOptions: {
          outputStyle: "expanded",
        },
      },
      scss: {},
    },
  },
  devServer: {
    client: {
      overlay: {
        // 让浏览器 overlay 同时显示警告和错误
        warnings: true,
        errors: true,
      },
    },
    host: "0.0.0.0",
    // 端口号
    port: 9090,
    https: false, // https:{type:Boolean}
    //配置自动启动浏览器 /为数组可以打开多个页面['/web/home','/cms/home']
    open: false,
    // 热更新
    hot: true,
    // 配置跨域处理，只有一个代理
    // proxy: "http://jsonplaceholder.typicode.com/",
    //配置多个跨域
    /* proxy: { }, */
    /* proxy: {
      "/api": {
        target: "http://192.168.2.254:8080", //代理地址，这里设置的地址会代替axios中设置的baseURL
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        //ws: true, // proxy websockets
        //pathRewrite方法重写urlW
        pathRewrite: {
          "^/api": "/",
        },
      },
    }, */
  },
};
