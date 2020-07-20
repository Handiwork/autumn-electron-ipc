const { merge } = require('webpack-merge');
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * batch resolve path
 * @param {string} root 
 * @param {Array<String>} children 
 */
function resolves(root, children) {
    return children.map(it => resolve(root, it))
}

const projectRoot = resolve(__dirname)
const [testRoot, libRoot, testOutRoot] = resolves(projectRoot, ["test", "lib", "test-build"])
const subRoots = ["ui", "pre", "main"]
const [uiRoot, ipcRoot, mainRoot] = resolves(testRoot, subRoots)
const [uiOutRoot, ipcOutRoot, mainOutRoot] = resolves(testOutRoot, subRoots)
const preloadLibraryName = "app"

const babelOptions = require('./babel.config');

const baseConfig = merge({
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: testRoot,
                use: {
                    loader: 'babel-loader',
                    options: babelOptions
                }
            },
            {
                test: /\.tsx?$/,
                include: [testRoot, libRoot],
                use: "ts-loader"
            },
        ]
    },
    devtool: "source-map",
    mode: "development",
    node: { __dirname: false },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '*'],
        alias: { "src": testRoot },
    },
})

const uiConfig = merge(baseConfig, {
    target: "web",
    entry: { app: resolve(uiRoot, 'index.ts') },
    output: { path: uiOutRoot },
    externals: { "test/pre": preloadLibraryName },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'autumn electron api test',
            template: resolve(uiRoot, 'index.html'),
        })
    ],
})

const preloadConfig = merge(baseConfig, {
    target: "electron-preload",
    entry: { index: resolve(ipcRoot, 'index.ts') },
    output: {
        library: preloadLibraryName,
        libraryTarget: "window",
        path: ipcOutRoot,
    },
})

const mainConfig = merge(baseConfig, {
    target: "electron-main",
    entry: { index: resolve(mainRoot, 'index.ts') },
    output: {
        libraryTarget: "commonjs2",
        path: mainOutRoot,
    },
})

module.exports = [uiConfig, preloadConfig, mainConfig]