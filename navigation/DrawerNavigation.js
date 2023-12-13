import { StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useSelector } from "react-redux";

import { selectUserType } from "../store/slices/userTypeSlice";
import HomeScreen from "../screens/HomeScreen";
import ToursHomeScreen from "../screens/Tours/ToursHomeScreen";
import ToursAnalyticsScreen from "../screens/Tours/ToursAnalyticsScreen";
import DriverHomeScreen from "../screens/Driver/DriverHomeScreen";
import TripsHistoryScreen from "../screens/DrawerScreens/TripsHistory/TripsHistoryScreen";
import SettingsScreen from "../screens/DrawerScreens/Settings/SettingsScreen";
import ManageScreen from "../screens/DrawerScreens/Manage/ManageScreen";
import FreightHomeScreen from "../screens/Freight/FreightHomeScreen";
import CustomDrawer from "./CustomDrawer";

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
    const userType = useSelector(selectUserType);

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
                headerShown: false,
                drawerActiveBackgroundColor: "#A7E92F",
                drawerActiveTintColor: "#000",
                drawerLabelStyle: {
                    fontSize: 16,
                    fontFamily: "SatoshiBold",
                    fontWeight: "600",
                    marginLeft: -10,
                },
            }}
        >
            {userType === "RentACarOwner" ? (
                <Drawer.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        drawerIcon: ({ color }) => (
                            <Ionicons name="home-outline" size={22} color={color} style={styles.icon} />
                        ),
                    }}
                />
            ) : userType === "ToursCompany" ? (
                <>
                    <Drawer.Screen
                        name="Home"
                        component={ToursHomeScreen}
                        options={{
                            drawerIcon: ({ color }) => (
                                <Ionicons name="home-outline" size={22} color={color} style={styles.icon} />
                            ),
                            headerShown: true,
                            headerTitle: "Tours",
                            headerTitleAlign: "center",
                            headerTitleStyle: {
                                fontSize: 20,
                                fontFamily: "SatoshiBlack",
                                fontWeight: "400",
                            },
                            headerStyle: {
                                height: 60,
                            },
                            headerBackTitleVisible: false,
                        }}
                    />
                    <Drawer.Screen
                        name="Analytics"
                        component={ToursAnalyticsScreen}
                        options={{
                            drawerIcon: ({ color }) => (
                                <Ionicons name="analytics-outline" size={22} color={color} style={styles.icon} />
                            ),
                            headerShown: true,
                            headerTitle: "Analytics",
                            headerTitleAlign: "center",
                            headerTitleStyle: {
                                fontSize: 20,
                                fontFamily: "SatoshiBlack",
                                fontWeight: "400",
                            },
                            headerStyle: {
                                height: 60,
                            },
                            headerBackTitleVisible: false,
                        }}
                    />
                </>
            ) : userType === "FreightRider" ? (
                <Drawer.Screen
                    name="Home"
                    component={FreightHomeScreen}
                    options={{
                        drawerIcon: ({ color }) => (
                            <Ionicons name="home-outline" size={22} color={color} style={styles.icon} />
                        ),
                    }}
                />
            ) : (
                userType === "Driver" && (
                    // driver home screen:
                    <Drawer.Screen
                        name="Home"
                        component={DriverHomeScreen}
                        options={{
                            drawerIcon: ({ color }) => (
                                <Ionicons name="home-outline" size={22} color={color} style={styles.icon} />
                            ),
                        }}
                    />
                )
            )}
            {userType === "RentACarOwner" && (
                <>
                    <Drawer.Screen
                        name="Past Trips"
                        component={TripsHistoryScreen}
                        options={{
                            drawerIcon: ({ color }) => (
                                <Ionicons name="analytics-outline" size={22} color={color} style={styles.icon} />
                            ),
                            headerShown: true,
                            headerTitle: "Past Trips",
                            headerTitleAlign: "center",
                            headerTitleStyle: {
                                fontSize: 21,
                                fontFamily: "SatoshiBlack",
                                fontWeight: "400",
                            },
                            headerStyle: {
                                height: 70,
                            },
                            headerBackTitleVisible: false,
                        }}
                    />
                    <Drawer.Screen
                        name="Manage"
                        component={ManageScreen}
                        options={{
                            drawerIcon: ({ color }) => (
                                <Ionicons name="people-outline" size={22} color={color} style={styles.icon} />
                            ),
                            headerShown: true,
                            headerTitle: "Manage",
                            headerTitleAlign: "center",
                            headerTitleStyle: {
                                fontSize: 21,
                                fontFamily: "SatoshiBlack",
                                fontWeight: "400",
                            },
                            headerStyle: {
                                height: 70,
                            },
                            headerBackTitleVisible: false,
                        }}
                    />
                </>
            )}
            {(userType === "RentACarOwner" || userType === "ToursCompany" || userType === "FreightRider") && (
                <Drawer.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                        drawerIcon: ({ color }) => (
                            <Ionicons name="settings-outline" size={22} color={color} style={styles.icon} />
                        ),
                        headerShown: true,
                        headerTitle: "Settings",
                        headerTitleAlign: "center",
                        headerTitleStyle: {
                            fontSize: 21,
                            fontFamily: "SatoshiBlack",
                            fontWeight: "400",
                        },
                        headerStyle: {
                            height: 70,
                        },
                        headerBackTitleVisible: false,
                    }}
                />
            )}
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    icon: {
        marginLeft: 10,
    },
});

export default DrawerNavigation;
