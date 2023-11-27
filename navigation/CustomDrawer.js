import { DEFAULT_PROFILE_IMAGE } from "@env";
import { useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { View, Text, StyleSheet, Image, Switch, TouchableOpacity, Share } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useSelector, useDispatch } from "react-redux";

import { useFirebase } from "../contexts/FirebaseContext";
import { selectUser, selectUserType } from "../store/slices/userSlice";
import { setDriver, selectDriver, resetDriver } from "../store/slices/driverSlice";

const CustomDrawer = (props) => {
    const { logout } = useFirebase();
    const user = useSelector(selectUser);
    const driver = useSelector(selectDriver);
    const userType = useSelector(selectUserType);
    const dispatch = useDispatch();

    const toggleSwitch = () => {
        const IsOnline = !driver.isOnline;
        dispatch(setDriver({ isOnline: IsOnline }));
    };

    useEffect(() => {
        if (driver.isOnline) {
            dispatch(setDriver({ isOnline: driver.isOnline }));
        }
    }, [driver.isOnline]);

    const onShare = async () => {
        try {
            const result = await Share.share({
                message:
                    "Hello! Here's a link to download Safri 360, a ride, tours and freight booking app. Tap and download 👇 \n[PLAYSTORE LINK HERE]",
                url: "https://play.google.com/store/apps?hl=en&gl=US",
                title: "Safri 360",
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log("Shared with activity type of: ", result.activityType);
                } else {
                    console.log("Shared");
                }
            } else if (result.action === Share.dismissedAction) {
                console.log("dismissed");
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleSignOut = () => {
        userType === "Driver" && dispatch(resetDriver());
        logout();
    };

    return (
        <View style={styles.mainContainer}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: "#9c9c9c" }}>
                {userType === "RentACarOwner" ? (
                    <View style={{ padding: 20 }}>
                        <Image
                            source={{ uri: user.photoURL ? user.photoURL : DEFAULT_PROFILE_IMAGE }}
                            style={styles.profileImage}
                        />
                        <Text style={styles.userName}>{user.userName || "User Name"}</Text>
                    </View>
                ) : (
                    userType === "Driver" && (
                        <View style={{ padding: 20 }}>
                            <Text style={styles.userName}>{driver.firstName || "User Name"}</Text>
                        </View>
                    )
                )}
                <View style={styles.drawerListItems}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <View style={styles.bottomMenu}>
                {userType === "Driver" && (
                    <View style={styles.switchContainer}>
                        <Text style={styles.isOnlineSwitchText}>Go {driver.isOnline ? "Offline" : "Online"}</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#A7E92F" }}
                            thumbColor={driver.isOnline ? "#A7E92F" : "#767577"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitch}
                            value={driver.isOnline}
                            style={styles.isOnlineSwitch}
                        />
                    </View>
                )}
                <TouchableOpacity onPress={() => onShare()} style={styles.button}>
                    <View style={styles.buttonInner}>
                        <Ionicons name="share-social-outline" size={22} style={styles.icon} />
                        <Text style={styles.buttonText}>Tell a Friend</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSignOut()} style={styles.button}>
                    <View style={styles.buttonInner}>
                        <Ionicons name="exit-outline" size={22} style={styles.icon} />
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    profileImage: {
        height: 80,
        width: 80,
        borderRadius: 40,
        borderColor: "#A7E92F",
        borderWidth: 2,
        marginBottom: 10,
    },
    userName: {
        color: "#fff",
        fontSize: 20,
        fontFamily: "SatoshiBold",
        fontWeight: "500",
        margin: 5,
    },
    drawerListItems: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 10,
    },
    bottomMenu: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: "#ccc",
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    isOnlineSwitch: {
        marginLeft: "auto",
    },
    isOnlineSwitchText: {
        fontSize: 15,
        fontFamily: "SatoshiMedium",
        fontWeight: "500",
        marginRight: 15,
    },
    button: {
        paddingVertical: 15,
    },
    buttonInner: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginLeft: 10,
    },
    buttonText: {
        fontSize: 15,
        fontFamily: "SatoshiMedium",
        fontWeight: "500",
        marginLeft: 15,
    },
});

export default CustomDrawer;
