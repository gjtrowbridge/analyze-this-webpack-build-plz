const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: {
        index: './server/index.ts'
    },
    externals: [nodeExternals()],
    externalsPresets: { node: true },
    mode: 'production',
    module: {
        rules: [
            {
                include: path.resolve(__dirname, "shared/helpers.ts"),
                sideEffects: false,
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {
        usedExports: true,
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/server'),
    },
    resolve: {
        extensions: ['.ts']
    },
    target: 'node',
};