import "expo-dev-client";
import { useState, useEffect, createRef } from "react";
import { ActivityIndicator, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useReduxDevToolsExtension } from "@react-navigation/devtools";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { auth } from "./firebase/config";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { store, persistor } from "./store/index";
import { selectUserType } from "./store/slices/userSlice";
import FontLoader from "./components/FontLoader";
import DrawerNavigation from "./navigation/DrawerNavigation";
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import PasswordResetScreen from "./screens/PasswordResetScreen";
import PhoneRegisterScreen from "./screens/PhoneRegisterScreen";
import OTPVerificationScreen from "./screens/OTPVerificationScreen";
import TripHistoryDetailScreen from "./screens/DrawerScreens/TripsHistory/TripHistoryDetailScreen";
import ChangePasswordScreen from "./screens/DrawerScreens/Settings/ChangePasswordScreen";
import EditProfileScreen from "./screens/DrawerScreens/Settings/EditProfileScreen";
import ChangePhoneNumberScreen from "./screens/DrawerScreens/Settings/ChangePhoneNumberScreen";
import DisplayCarsScreen from "./screens/DrawerScreens/Manage/Cars/DisplayCarsScreen";
import CarsDetailScreen from "./screens/DrawerScreens/Manage/Cars/CarsDetailScreen";
import AddCar from "./screens/DrawerScreens/Manage/Cars/AddCar";
import EditCarScreen from "./screens/DrawerScreens/Manage/Cars/EditCar";
import DriverLoginScreen from "./screens/DriverLoginScreen";
import DriverInfoInputScreen from "./screens/DriverInfoInputScreen";
import DisplayDriversScreen from "./screens/DrawerScreens/Manage/Drivers/DisplayDriversScreen";
import DriverDetailScreen from "./screens/DrawerScreens/Manage/Drivers/DriverDetailScreen";
import AddDriver from "./screens/DrawerScreens/Manage/Drivers/AddDriver";
import DriverHomeScreen from "./screens/DriverHomeScreen";

const Stack = createStackNavigator();
navigator.geolocation = require("react-native-geolocation-service");

const App = () => {
    const [loading, setLoading] = useState(true);
    const navigationRef = createRef();

    const userType = useSelector(selectUserType);
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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <FirebaseProvider>
                <FontLoader>
                    <SafeAreaProvider>
                        <NavigationContainer ref={() => navigationRef}>
                            <StatusBar barStyle="default" animated={true} />
                            <Stack.Navigator
                                initialRouteName={
                                    auth.currentUser === null && userType === null
                                        ? "WelcomeScreen"
                                        : userType === "RentACar"
                                        ? "Home"
                                        : userType === "Driver"
                                        ? "DriverLogin"
                                        : "WelcomeScreen"
                                }
                                screenOptions={{ headerShown: false, animationEnabled: false }}
                            >
                                <Stack.Screen name="HomeScreen" component={DrawerNavigation} />
                                <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                                <Stack.Screen name="Login" component={LoginScreen} />
                                <Stack.Screen name="SignUp" component={SignUpScreen} />
                                <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
                                <Stack.Screen name="DriverInfoInput" component={DriverInfoInputScreen} />
                                <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
                                <Stack.Screen name="PhoneRegisterScreen" component={PhoneRegisterScreen} />
                                <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
                                <Stack.Screen name="TripHistoryDetailScreen" component={TripHistoryDetailScreen} />
                                <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
                                <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
                                <Stack.Screen name="ChangePhoneNumberScreen" component={ChangePhoneNumberScreen} />
                                <Stack.Screen name="DisplayCarsScreen" component={DisplayCarsScreen} />
                                <Stack.Screen name="DisplayDriversScreen" component={DisplayDriversScreen} />
                                <Stack.Screen name="AddCarScreen" component={AddCar} />
                                <Stack.Screen name="AddDriverScreen" component={AddDriver} />
                                <Stack.Screen name="EditCarScreen" component={EditCarScreen} />
                                <Stack.Screen name="CarsDetailScreen" component={CarsDetailScreen} />
                                <Stack.Screen name="DriverDetailScreen" component={DriverDetailScreen} />
                                <Stack.Screen name="DriverHomeScreen" component={DriverHomeScreen} />
                            </Stack.Navigator>
                        </NavigationContainer>
                    </SafeAreaProvider>
                </FontLoader>
            </FirebaseProvider>
        </GestureHandlerRootView>
    );
};

const AppWithProvider = () => (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
    </Provider>
);

export default AppWithProvider;
