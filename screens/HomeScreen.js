import { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    Switch,
    Alert,
    BackHandler,
    Dimensions,
    PermissionsAndroid,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import { useSelector, useDispatch } from "react-redux";

import DrawerMenuButton from "../components/Buttons/DrawerMenuButton";
import Map from "../components/Map";
import { useMapContext } from "../contexts/MapContext";
import { moveCameraToCenter } from "../utils/moveCameraToCenter";
import { selectUser, setUser } from "../store/slices/userSlice";
import { setCurrentUserLocation } from "../store/slices/locationSlice";
import { setOrigin, setDestination } from "../store/slices/navigationSlice";

const HomeScreen = ({ navigation }) => {
    const [initialPosition, setInitialPosition] = useState(null);

    const { width, height } = Dimensions.get("window");
    const { mapRef } = useMapContext();
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    const ASPECT_RATIO = width / height;
    const LATITUDE_DELTA = 0.03;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

    const [isEnabled, setIsEnabled] = useState(user.isOnline);
    const toggleSwitch = () => {
        const updatedIsOnline = !isEnabled;
        setIsEnabled(updatedIsOnline);
        dispatch(setUser({ isOnline: updatedIsOnline }));
    };

    useEffect(() => {
        dispatch(setOrigin(null));
        dispatch(setDestination(null));

        if (user.isOnline) {
            getLocation();
        }

        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    useEffect(() => {
        setIsEnabled(user.isOnline);
    }, [user.isOnline]);

    const getLocation = async () => {
        const hasLocationPermission = await requestLocationPermission();
        if (hasLocationPermission) {
            Geolocation.getCurrentPosition(
                (position) => {
                    dispatch(setCurrentUserLocation(extractCoordinates(position)));
                    setInitialPosition({
                        ...extractCoordinates(position),
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    });
                    dispatch(setOrigin(extractCoordinates(position)));
                    moveCameraToCenter(mapRef, position.coords);
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
            );
        }
    };

    const extractCoordinates = (position) => {
        const latitude = position?.coords?.latitude;
        const longitude = position?.coords?.longitude;
        return {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
        };
    };

    const requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use Geolocation");
                return true;
            } else {
                console.log("You cannot use Geolocation");
                return false;
            }
        } catch (error) {
            console.error("Error getting current location: ", error);
            return false;
        }
    };

    const restrictGoingBack = () => {
        Alert.alert("Hold on!", "Are you sure you want to exit the app?", [
            {
                text: "Cancel",
                onPress: () => null,
                style: "cancel",
            },
            { text: "YES", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
    };

    const openDrawerMenu = () => {
        navigation.openDrawer();
    };

    return (
        <View style={styles.container}>
            {user.isOnline ? (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.mainContainer}>
                        <DrawerMenuButton openDrawer={openDrawerMenu} />
                        <View style={styles.mapContainer}>
                            <Map initialPosition={initialPosition} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
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
    mainContainer: {
        height: "100%",
        width: "100%",
    },
    mapContainer: {
        flex: 1,
        width: "100%",
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
