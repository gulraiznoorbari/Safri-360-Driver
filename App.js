import "expo-dev-client";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, createRef } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useReduxDevToolsExtension } from "@react-navigation/devtools";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { auth } from "./firebase/config";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { store, persistor } from "./store/index";
import FontLoader from "./components/FontLoader";
import DrawerNavigation from "./navigation/DrawerNavigation";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import PasswordResetScreen from "./screens/PasswordResetScreen";
import PhoneRegisterScreen from "./screens/PhoneRegisterScreen";
import OTPVerificationScreen from "./screens/OTPVerificationScreen";
import TripHistoryDetailScreen from "./screens/TripHistoryDetailScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import ChangePhoneNumberScreen from "./screens/ChangePhoneNumberScreen";

const Stack = createStackNavigator();
navigator.geolocation = require("react-native-geolocation-service");

const App = () => {
    const [loading, setLoading] = useState(true);
    const navigationRef = createRef();

    useReduxDevToolsExtension(navigationRef);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setLoading(false);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <ActivityIndicator
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                size="large"
                color="#000"
            />
        );
    }

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <FirebaseProvider>
                        <FontLoader>
                            <NavigationContainer ref={() => navigationRef}>
                                <SafeAreaProvider>
                                    <StatusBar style="auto" animated={true} />
                                    <Stack.Navigator
                                        initialRouteName={auth.currentUser === null ? "Login" : "Home"}
                                        screenOptions={{ headerShown: false, animation: "none" }}
                                    >
                                        <Stack.Screen name="Home" component={DrawerNavigation} />
                                        <Stack.Screen name="Login" component={LoginScreen} />
                                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                                        <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
                                        <Stack.Screen name="PhoneRegisterScreen" component={PhoneRegisterScreen} />
                                        <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
                                        <Stack.Screen
                                            name="TripHistoryDetailScreen"
                                            component={TripHistoryDetailScreen}
                                        />
                                        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
                                        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
                                        <Stack.Screen
                                            name="ChangePhoneNumberScreen"
                                            component={ChangePhoneNumberScreen}
                                        />
                                    </Stack.Navigator>
                                </SafeAreaProvider>
                            </NavigationContainer>
                        </FontLoader>
                    </FirebaseProvider>
                </GestureHandlerRootView>
            </PersistGate>
        </Provider>
    );
};

export default App;
