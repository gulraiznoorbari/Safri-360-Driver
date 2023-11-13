import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Alert, BackHandler, Dimensions, PermissionsAndroid } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Geolocation from "react-native-geolocation-service";

import DrawerMenuButton from "../components/Buttons/DrawerMenuButton";
import HomeMap from "../components/HomeMap";
import { moveCameraToCenter } from "../utils/moveCameraToCenter";
import { setOrigin } from "../store/slices/navigationSlice";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const HomeScreen = ({ navigation }) => {
    const [initialPosition, setInitialPosition] = useState(null);

    const dispatch = useDispatch();
    const mapRef = useRef(null);

    useEffect(() => {
        dispatch(setOrigin(null));
        getLocation();

        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    const extractCoordinates = (position) => {
        const latitude = position?.coords?.latitude;
        const longitude = position?.coords?.longitude;
        return {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
        };
    };

    const getLocation = async () => {
        const hasLocationPermission = await requestLocationPermission();
        if (hasLocationPermission) {
            Geolocation.getCurrentPosition(
                (position) => {
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
        <View style={styles.mainContainer}>
            <DrawerMenuButton openDrawer={() => openDrawerMenu()} />
            <View style={styles.mapContainer}>
                <HomeMap initialPosition={initialPosition} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        height: "100%",
        width: "100%",
    },
    mapContainer: {
        flex: 1,
    },
});

export default HomeScreen;
