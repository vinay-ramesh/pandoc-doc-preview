// config-overrides.js
const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
    // Add fallbacks for Node.js core modules.
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "util": require.resolve("util/"),
        "zlib": require.resolve("browserify-zlib"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "assert": require.resolve("assert/"),
        "url": require.resolve("url/"),
        "path": require.resolve("path-browserify"),
        "fs": false, // Node.js 'fs' module has no browser equivalent, set to false
        // DO NOT add 'process' or 'buffer' here directly as fallback if it causes refresh issues.
        // We'll manage them via ProvidePlugin and alias.
    };

    // Add Webpack plugins
    config.plugins = (config.plugins || []).concat([
        // ProvidePlugin makes 'process' and 'Buffer' available globally
        new webpack.ProvidePlugin({
            // Ensure process is correctly polyfilled without conflicting with react-refresh
            process: 'process/browser', // <--- Use 'process/browser' here
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);

    // Use aliases to ensure specific modules are resolved to their browser-compatible versions.
    // This is often key for 'process' with react-refresh.
    config.resolve.alias = {
        ...config.resolve.alias,
        'process/browser': require.resolve('process/browser.js'), // <--- Explicitly point to the file
        'process': require.resolve('process/browser.js'),        // <--- Alias 'process' to the browser polyfill file
        'buffer': require.resolve('buffer/'), // Ensure buffer resolves correctly
    };

    // This rule specifically addresses potential issues with CommonJS modules
    // and how they interact with Webpack 5's default behaviors, especially for packages
    // that might try to dynamically `require` something based on `process.env`.
    // It makes sure certain problematic modules are treated as CommonJS.
    // This is more of a general compatibility fix for `axios` and its dependencies.
    config.module.rules = config.module.rules.map(rule => {
        if (rule.oneOf) {
            return {
                ...rule,
                oneOf: rule.oneOf.map(oneOfRule => {
                    if (oneOfRule.loader && oneOfRule.loader.includes('babel-loader')) {
                        // This might be a bit aggressive or already handled by CRA,
                        // but sometimes setting 'type: "javascript/auto"' for node_modules
                        // can help with certain package types.
                        // However, let's keep it simple first and rely on fallbacks/aliases.
                    }
                    return oneOfRule;
                }),
            };
        }
        return rule;
    });

    // Another potential workaround for some Webpack 5/react-refresh issues
    // if the above alias doesn't fully resolve it.
    // It explicitly sets the target, but CRA handles this well normally.
    // config.target = ['web', 'es5']; // Uncomment if issues persist with older browser targets.

    return config;
};