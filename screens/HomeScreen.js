import { useState, useEffect } from "react";
import { StyleSheet, View, Alert, BackHandler, Dimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Geolocation from "react-native-geolocation-service";
import { ref, update } from "firebase/database";

import { dbRealtime } from "../firebase/config";
import { useMapContext } from "../contexts/MapContext";
import { requestLocationPermission } from "../utils/requestLocation";
import { moveCameraToCenter } from "../utils/moveCameraToCenter";
import { setOrigin } from "../store/slices/navigationSlice";
import { selectRentACarUser } from "../store/slices/rentACarSlice";
import DrawerMenuButton from "../components/Buttons/DrawerMenuButton";
import HomeMap from "../components/HomeMap";
import RideRequestCards from "../components/RentACar/RideRequestCards";
import AvailableDriversList from "../components/RentACar/AvailableDriversList";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.03;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const HomeScreen = ({ navigation }) => {
    const [initialPosition, setInitialPosition] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedRide, setSelectedRide] = useState({});

    const dispatch = useDispatch();
    const { mapRef } = useMapContext();
    const rentACarUser = useSelector(selectRentACarUser);

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
                    const userRef = ref(dbRealtime, "Rent A Car/" + rentACarUser.uid);
                    update(userRef, {
                        location: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        },
                    })
                        .then(() => {
                            dispatch(setOrigin(extractCoordinates(position)));
                            moveCameraToCenter(mapRef, position.coords);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
            );
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
