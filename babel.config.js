module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@assets": "./assets",
                        "@screens": "./screens",
                        "@components": "./components",
                        "@contexts": "./contexts",
                        "@store": "./store",
                        "@utils": "./utils",
                    },
                },
            ],
            [
                "module:react-native-dotenv",
                {
                    envName: "APP_ENV",
                    moduleName: "@env",
                    path: ".env",
                },
            ],
            "react-native-reanimated/plugin",
        ],
    };
};
