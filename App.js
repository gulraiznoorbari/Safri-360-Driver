import "expo-dev-client";
import { useState, useEffect, createRef } from "react";
import { ActivityIndicator, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import FlashMessage from "react-native-flash-message";
import { useReduxDevToolsExtension } from "@react-navigation/devtools";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { auth } from "./firebase/config";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { MapProvider } from "./contexts/MapContext";
import { store, persistor } from "./store/index";
import { selectUserType } from "./store/slices/userTypeSlice";
import { selectDriver } from "./store/slices/driverSlice";
import FontLoader from "./components/FontLoader";
import DrawerNavigation from "./navigation/DrawerNavigation";
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreenNames from "./screens/SignUpScreenNames";
import SignUpScreenVehicleInfo from "./screens/SignUpScreenVehicleInfo";
import SignUpScreenCredentials from "./screens/SignUpScreenCredentials";
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
import TourDetailScreen from "./screens/Tours/TourDetailScreen";
import AddTourMain from "./screens/Tours/CreateTourScreens/AddTourMain";
import AddTourFare from "./screens/Tours/CreateTourScreens/AddTourFare";
import AddTourCompany from "./screens/Tours/CreateTourScreens/AddTourCompany";
import DriverLoginScreen from "./screens/Driver/DriverLoginScreen";
import DriverInfoInputScreen from "./screens/Driver/DriverInfoInputScreen";
import DisplayDriversScreen from "./screens/DrawerScreens/Manage/Drivers/DisplayDriversScreen";
import DriverDetailScreen from "./screens/DrawerScreens/Manage/Drivers/DriverDetailScreen";
import AddDriver from "./screens/DrawerScreens/Manage/Drivers/AddDriver";

const Stack = createStackNavigator();
navigator.geolocation = require("react-native-geolocation-service");

const App = () => {
    const [loading, setLoading] = useState(true);
    const userType = useSelector(selectUserType);

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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <FirebaseProvider>
                <MapProvider>
                    <FontLoader>
                        <SafeAreaProvider>
                            <StatusBar barStyle="default" animated={true} />
                            <FlashMessage position="top" />
                            {userType === "RentACarOwner" ? (
                                <RentACarOwnerScreens />
                            ) : userType === "ToursCompany" ? (
                                <TourScreens />
                            ) : userType === "FreightRider" ? (
                                <FreightScreens />
                            ) : userType === "Driver" ? (
                                <DriverScreens />
                            ) : (
                                <NavigationContainer ref={() => navigationRef}>
                                    <Stack.Navigator
                                        initialRouteName="WelcomeScreen"
                                        screenOptions={{ headerShown: false, animationEnabled: false }}
                                    >
                                        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                                    </Stack.Navigator>
                                </NavigationContainer>
                            )}
                        </SafeAreaProvider>
                    </FontLoader>
                </MapProvider>
            </FirebaseProvider>
        </GestureHandlerRootView>
    );
};

const RentACarOwnerScreens = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={auth.currentUser !== null ? "Home" : "Login"}
                screenOptions={{ headerShown: false, animationEnabled: false }}
            >
                <Stack.Screen name="HomeScreen" component={DrawerNavigation} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUpScreenNames" component={SignUpScreenNames} />
                <Stack.Screen name="SignUpScreenCredentials" component={SignUpScreenCredentials} />
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
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const TourScreens = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={auth.currentUser !== null ? "Home" : "Login"}
                screenOptions={{ headerShown: false, animationEnabled: false }}
            >
                <Stack.Screen name="HomeScreen" component={DrawerNavigation} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUpScreenNames" component={SignUpScreenNames} />
                <Stack.Screen name="SignUpScreenCredentials" component={SignUpScreenCredentials} />
                <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
                <Stack.Screen name="PhoneRegisterScreen" component={PhoneRegisterScreen} />
                <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
                <Stack.Screen name="TourDetailScreen" component={TourDetailScreen} />
                <Stack.Screen name="AddTourMainScreen" component={AddTourMain} />
                <Stack.Screen name="AddTourFareScreen" component={AddTourFare} />
                <Stack.Screen name="AddTourCompanyScreen" component={AddTourCompany} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const FreightScreens = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={auth.currentUser !== null ? "Home" : "Login"}
                screenOptions={{ headerShown: false, animationEnabled: false }}
            >
                <Stack.Screen name="HomeScreen" component={DrawerNavigation} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUpScreenNames" component={SignUpScreenNames} />
                <Stack.Screen name="SignUpScreenVehicleInfo" component={SignUpScreenVehicleInfo} />
                <Stack.Screen name="SignUpScreenCredentials" component={SignUpScreenCredentials} />
                <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
                <Stack.Screen name="PhoneRegisterScreen" component={PhoneRegisterScreen} />
                <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const DriverScreens = () => {
    const driver = useSelector(selectDriver);

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={driver.isLoggedIn ? "Home" : "DriverLogin"}
                screenOptions={{ headerShown: false, animationEnabled: false }}
            >
                <Stack.Screen name="DriverHomeScreen" component={DrawerNavigation} />
                <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
                <Stack.Screen name="DriverInfoInput" component={DriverInfoInputScreen} />
            </Stack.Navigator>
        </NavigationContainer>
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
