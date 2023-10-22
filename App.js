import "expo-dev-client";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import FontLoader from "./components/FontLoader";
import HomeScreen from "./screens/HomeScreen";

const Stack = createStackNavigator();
navigator.geolocation = require("react-native-geolocation-service");

const App = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <FontLoader>
                <NavigationContainer>
                    <StatusBar style="auto" />
                    <Stack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
                        <Stack.Screen name="Home" component={HomeScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
            </FontLoader>
        </GestureHandlerRootView>
    );
};

export default App;
