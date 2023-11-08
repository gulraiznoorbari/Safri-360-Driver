import { DEFAULT_PROFILE_IMAGE } from "@env";
import { useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { View, Text, StyleSheet, Image, Switch, TouchableOpacity, Share } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";

import { selectUser, setUser } from "../store/slices/userSlice";
import { useFirebase } from "../contexts/FirebaseContext";

const CustomDrawer = (props) => {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { logout } = useFirebase();

    const toggleSwitch = () => {
        const IsOnline = !user.isOnline;
        dispatch(setUser({ isOnline: IsOnline }));
    };

    useEffect(() => {
        if (user.isOnline) {
            dispatch(setUser({ isOnline: user.isOnline }));
        }
    }, [user.isOnline]);

    const onShare = async () => {
        try {
            const result = await Share.share({
                message:
                    "Hello! Here's a link to download Safri 360, a ride, tours and freight booking app where you get to offer the fare. Tap and download 👇 \n[PLAYSTORE LINK HERE]",
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
        logout();
        navigation.navigate("WelcomeScreen");
    };

    return (
        <View style={styles.mainContainer}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: "#9c9c9c" }}>
                <View style={{ padding: 20 }}>
                    {user.photoURL ? (
                        <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                    ) : (
                        <Image source={{ uri: DEFAULT_PROFILE_IMAGE }} style={styles.profileImage} />
                    )}
                    <Text style={styles.userName}>{user.userName || "User Name"}</Text>
                    <View style={styles.rating}>
                        <Text style={styles.ratingNumber}>4.5</Text>
                        <Ionicons name="star" size={16} color="gold" style={styles.ratingStar} />
                        <Ionicons name="star" size={16} color="gold" style={styles.ratingStar} />
                        <Ionicons name="star" size={16} color="gold" style={styles.ratingStar} />
                        <Ionicons name="star" size={16} color="gold" style={styles.ratingStar} />
                        <Ionicons name="star-half" size={16} color="gold" style={styles.ratingStar} />
                    </View>
                </View>
                <View style={styles.drawerListItems}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <View style={styles.bottomMenu}>
                <View style={styles.switchContainer}>
                    <Text style={styles.isOnlineSwitchText}>Go {user.isOnline ? "Offline" : "Online"}</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#A7E92F" }}
                        thumbColor={user.isOnline ? "#A7E92F" : "#767577"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={user.isOnline}
                        style={styles.isOnlineSwitch}
                    />
                </View>
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
        fontSize: 18,
        fontFamily: "SatoshiBlack",
        fontWeight: "600",
        marginBottom: 5,
    },
    rating: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingNumber: {
        color: "#fff",
        fontSize: 15,
        fontFamily: "SatoshiBold",
        fontWeight: "500",
        marginRight: 10,
    },
    ratingStar: {
        marginRight: 5,
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
    button: {
        paddingVertical: 15,
    },
    buttonInner: {
        flexDirection: "row",
        alignItems: "center",
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
