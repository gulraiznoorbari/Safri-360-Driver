import { GOOGLE_MAPS_API_KEY } from "@env";
import { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    Text,
    View,
    Alert,
    Keyboard,
    BackHandler,
    Dimensions,
    PermissionsAndroid,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { ref, set, child } from "firebase/database";
import MapView, { Marker, AnimatedRegion, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import Geolocation from "react-native-geolocation-service";
import haversine from "haversine";

import DrawerMenuButton from "../components/Buttons/DrawerMenuButton";
import { dbRealtime, geoFire } from "../firebase/config";
import { moveCameraToCenter } from "../utils/moveCameraToCenter";
import { setCurrentUserLocation, selectCurrentUserLocation } from "../store/slices/locationSlice";
import { setOrigin, setDestination, selectOrigin, selectDestination } from "../store/slices/navigationSlice";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const HomeScreen = ({ navigation }) => {
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [prevLatLng, setPrevLatLng] = useState({});
    const [distanceTravelled, setDistanceTravelled] = useState(0);
    const [tracking, setTracking] = useState(false);

    const currentUserLocation = useSelector(selectCurrentUserLocation);
    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const dispatch = useDispatch();
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const [region, setRegion] = useState({
        latitude: currentUserLocation ? currentUserLocation.latitude : 0,
        longitude: currentUserLocation ? currentUserLocation.longitude : 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    });
    const getMapRegion = () => ({
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    });

    useEffect(() => {
        dispatch(setOrigin(null));
        dispatch(setDestination(null));
        getLocation();

        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    useEffect(() => {
        const calcDistance = (newLatLng) => {
            return haversine(prevLatLng, newLatLng) || 0;
        };

        const watchId = Geolocation.watchPosition(
            (position) => {
                console.log("Watch Position Called");
                const { latitude, longitude } = position.coords;
                // geoFire.set(user.uid, [latitude, longitude]);
                const updatedCoordinates = { latitude: latitude, longitude: longitude };
                console.log("UpdatedCoordinates: ", updatedCoordinates);
                if (markerRef.current) {
                    markerRef.current?.animateMarkerToCoordinate(updatedCoordinates, 500);
                }

                setRegion({
                    ...region,
                    latitude: updatedCoordinates.latitude,
                    longitude: updatedCoordinates.longitude,
                });
                setRouteCoordinates([...routeCoordinates, updatedCoordinates]);
                setDistanceTravelled(distanceTravelled + calcDistance(updatedCoordinates));
                setPrevLatLng(updatedCoordinates);
            },
            (error) => console.log("Error from Watch Position: ", error),
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000,
                distanceFilter: 3,
            },
        );
        return () => Geolocation.clearWatch(watchId);
    }, [region.latitude, region.longitude, tracking]);

    const getLocation = async () => {
        const hasLocationPermission = await requestLocationPermission();
        if (hasLocationPermission) {
            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    dispatch(setCurrentUserLocation({ latitude, longitude }));
                    moveCameraToCenter(mapRef, position.coords);
                    setTracking(true);
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
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                {currentUserLocation ? (
                    <View style={styles.mainContainer}>
                        <DrawerMenuButton openDrawer={openDrawerMenu} />
                        <View style={styles.mapContainer}>
                            <MapView
                                ref={mapRef}
                                region={region}
                                style={styles.map}
                                provider={PROVIDER_GOOGLE}
                                showsUserLocation={true}
                                followsUserLocation={true}
                                loadingEnabled={true}
                                mapPadding={{ top: 0, right: 5, bottom: 5, left: 5 }}
                            >
                                <Polyline coordinates={routeCoordinates} strokeWidth={5} />
                                <Marker.Animated ref={markerRef} coordinate={getMapRegion()} />
                                {/* {origin && <Marker coordinate={origin} />} */}
                                {/* {destination && <Marker coordinate={destination} />} */}
                                {/* {origin && destination ? (
                                    <MapViewDirections
                                        origin={origin}
                                        destination={destination}
                                        apikey={GOOGLE_MAPS_API_KEY}
                                        mode="DRIVING"
                                        strokeColor="#000"
                                        strokeWidth={2}
                                        precision="high"
                                        optimizeWaypoints={true}
                                    />
                                ) : null} */}
                            </MapView>
                            <Text style={styles.distanceInfo}>
                                Distance Travelled: {parseFloat(distanceTravelled).toFixed(2)} km
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                )}
            </TouchableWithoutFeedback>
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
    },
    map: {
        flex: 1,
    },
    distanceInfo: {
        padding: 20,
        backgroundColor: "#fff",
        textAlign: "center",
        fontSize: 18,
        fontFamily: "SatoshiBlack",
        fontWeight: "500",
    },
});

export default HomeScreen;
