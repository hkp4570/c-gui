const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 打包css文件
const {CleanWebpackPlugin} = require("clean-webpack-plugin"); // 清除 dist 目录

module.exports = {
    mode: 'development',
    entry: {
        main: ['./src/index.js', './style/index.scss'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'c-gui.js',
        library: 'c-gui',
        libraryTarget: 'umd',

    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader,'style-loader','css-loader','sass-loader']
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "css/[name].[contenthash:5].css"
        })
    ]
}