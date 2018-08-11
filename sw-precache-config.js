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
            urlPattern: "/api/comics",
            handler: "networkFirst"
        },
        {
            urlPattern: "/api/comic/(.*)",
            handler: "networkFirst"
        },
        {
            urlPattern: "/api/read/(.*)",
            handler: "networkFirst"
        },
        {
            urlPattern: "/api/image/(.*)",
            handler: "fastest"
        },
        {
            urlPattern: /https:\/\/comicvine.gamespot.com\/.*/,
            handler: "fastest"
        }
    ]
};
