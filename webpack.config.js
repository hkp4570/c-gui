const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 打包css文件
const {CleanWebpackPlugin} = require("clean-webpack-plugin"); // 清除 dist 目录

module.exports = {
    mode: 'development',
    entry: {
        main: './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/c-gui.js',
        library: 'c_gui',
        libraryTarget: 'umd',

    },
    watch: true,
    module: {
        rules: [
            {
                test: /\.scss$/i,
                use: [MiniCssExtractPlugin.loader,'css-loader','sass-loader']
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        // new HtmlWebpackPlugin({
        //     template: './index.html', // 指定HTML模板文件路径
        //     inject: true, // 默认设置，允许插件修改HTML并注入所有资源
        // }),
        new MiniCssExtractPlugin({
            filename: "css/c-gui.css"
        })
    ]
}