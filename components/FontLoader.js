import { useState, useEffect } from "react";
import * as Font from "expo-font";

const FontLoader = ({ children }) => {
    const [fontLoaded, setFontLoaded] = useState(false);

    const loadFont = async () => {
        await Font.loadAsync({
            Satoshi: require("../assets/fonts/Satoshi-Regular.otf"),
            SatoshiMedium: require("../assets/fonts/Satoshi-Medium.otf"),
            SatoshiLight: require("../assets/fonts/Satoshi-Light.otf"),
            SatoshiBlack: require("../assets/fonts/Satoshi-Black.otf"),
            SatoshiBold: require("../assets/fonts/Satoshi-Bold.otf"),
        });
        setFontLoaded(true);
    };

    useEffect(() => {
        loadFont();
    }, []);

    if (!fontLoaded) {
        return null;
    }

    return children;
};

export default FontLoader;
