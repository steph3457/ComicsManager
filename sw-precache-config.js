module.exports = {
    navigateFallback: "/index.html",
    stripPrefix: "dist",
    root: "dist/",
    staticFileGlobs: [
        "dist/index.html",
        "dist/**.js",
        "dist/**.css",
        "dist/manifest.json"
    ],
    runtimeCaching: [
        {
            urlPattern: "/getConfig",
            handler: "networkFirst"
        },
        {
            urlPattern: "/getLibrary",
            handler: "networkFirst"
        },
        {
            urlPattern: /https:\/\/maxcdn.bootstrapcdn.com\/.*.css/,
            handler: "networkFirst"
        }
    ]
};
