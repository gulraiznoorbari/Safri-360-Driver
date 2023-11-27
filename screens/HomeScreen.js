import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Alert, BackHandler, Dimensions, PermissionsAndroid } from "react-native";
import { useDispatch } from "react-redux";
import Geolocation from "react-native-geolocation-service";

import { moveCameraToCenter } from "../utils/moveCameraToCenter";
import { setOrigin } from "../store/slices/navigationSlice";
import DrawerMenuButton from "../components/Buttons/DrawerMenuButton";
import HomeMap from "../components/HomeMap";
import RideRequestCards from "../components/Cards/RideRequestCards";
import AvailableDriversList from "../components/AvailableDriversList";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.03;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const HomeScreen = ({ navigation }) => {
    const [initialPosition, setInitialPosition] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedRide, setSelectedRide] = useState({});

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
            <DrawerMenuButton action={() => openDrawerMenu()} />
            <View style={styles.mapContainer}>
                <HomeMap initialPosition={initialPosition} />
            </View>
            <View style={styles.overlayContainer}>
                <RideRequestCards setModalVisible={setModalVisible} setSelectedRide={setSelectedRide} />
                <AvailableDriversList
                    isModalVisible={isModalVisible}
                    setModalVisible={setModalVisible}
                    selectedRide={selectedRide}
                />
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
    overlayContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
});

export default HomeScreen;
