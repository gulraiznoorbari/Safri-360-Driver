import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Switch } from "react-native";
import { useSelector, useDispatch } from "react-redux";

import { selectUser, setUser } from "../store/slices/userSlice";

const HomeScreen = () => {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    const [isEnabled, setIsEnabled] = useState(user.isOnline);
    const toggleSwitch = () => {
        const updatedIsOnline = !isEnabled;
        setIsEnabled(updatedIsOnline);
        dispatch(setUser({ isOnline: updatedIsOnline }));
    };

    useEffect(() => {
        setIsEnabled(user.isOnline);
    }, [user.isOnline]);

    return (
        <View style={styles.container}>
            {user.isOnline ? (
                <Text style={styles.text}>Home Screen</Text>
            ) : (
                <View style={styles.buttonInner}>
                    <Text style={styles.isOnlineSwitchText}>Go {isEnabled ? "Offline" : "Online"}</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#A7E92F" }}
                        thumbColor={isEnabled ? "#A7E92F" : "#767577"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                        style={styles.isOnlineSwitch}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontSize: 24,
        fontWeight: "600",
        fontFamily: "SatoshiBlack",
    },
    buttonInner: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    isOnlineSwitchText: {
        fontSize: 20,
        fontFamily: "SatoshiBlack",
        fontWeight: "600",
    },
    isOnlineSwitch: {
        marginVertical: 20,
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    },
});

export default HomeScreen;
