import { GOOGLE_MAPS_API_KEY } from "@env";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
    StyleSheet,
    Dimensions,
    Text,
    View,
    Alert,
    Switch,
    Keyboard,
    TouchableOpacity,
    BackHandler,
    PermissionsAndroid,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { ref, update } from "firebase/database";
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion, Polyline } from "react-native-maps";
import Geolocation from "react-native-geolocation-service";
import MapViewDirections from "react-native-maps-directions";
import haversine from "haversine";

import { dbRealtime, geoFire } from "../../firebase/config";
import { useFirebase } from "../../contexts/FirebaseContext";
import { selectDriver, setDriver, resetDriver } from "../../store/slices/driverSlice";
import { setOrigin, selectOrigin, setDestination, selectDestination } from "../../store/slices/navigationSlice";
import { setCurrentUserLocation, selectCurrentUserLocation } from "../../store/slices/locationSlice";
import DrawerMenuButton from "../../components/Buttons/DrawerMenuButton";
import { moveCameraToCenter } from "../../utils/moveCameraToCenter";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.03;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const DriverHomeScreen = ({ navigation }) => {
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [prevLatLng, setPrevLatLng] = useState({});
    const [distanceTravelled, setDistanceTravelled] = useState(0);
    const [tracking, setTracking] = useState(false);
    const { logout } = useFirebase();

    const currentUserLocation = useSelector(selectCurrentUserLocation);
    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const driver = useSelector(selectDriver);
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

    useLayoutEffect(() => {
        if (driver.firstName === null && driver.lastName === null && driver.CNIC === null) {
            navigation.navigate("DriverInfoInput");
        }
    }, [navigation]);

    useEffect(() => {
        console.log("Is driver online? ", driver.isOnline);
        dispatch(setOrigin(null));
        dispatch(setDestination(null));
        if (driver.isOnline) getLocation();

        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    useEffect(() => {
        if (driver.isOnline) {
            dispatch(setDriver({ isOnline: driver.isOnline }));
            driverIsOnline();
        } else {
            driverIsOffline();
        }
    }, [driver.isOnline]);

    const toggleSwitch = () => {
        const IsOnline = !driver.isOnline;
        dispatch(setDriver({ isOnline: IsOnline, status: IsOnline ? "Online" : "Offline" }));
    };

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

    const locationPermission = () =>
        new Promise((resolve, reject) => {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                .then((granted) => {
                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        resolve("granted");
                    }
                    return reject("Location Permission denied");
                })
                .catch((error) => {
                    console.log("Ask Location permission error: ", error);
                    return reject(error);
                });
        });

    const getLocation = async () => {
        const hasLocationPermission = await locationPermission();
        if (hasLocationPermission) {
            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("Latitude: ", latitude);
                    console.log("Longitude: ", longitude);
                    dispatch(setOrigin({ latitude: latitude, longitude: longitude }));
                    // dispatch(setCurrentUserLocation({ latitude, longitude }));
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

    const driverIsOnline = () => {
        const userRef = ref(dbRealtime, "Drivers/" + driver.pinCode);
        update(userRef, { status: "Online" })
            .then(() => {
                console.log("DriverStatus set to online");
            })
            .catch((error) => {
                console.log("Error setting DriverStatus to online: ", error);
            });
    };

    const driverIsOffline = () => {
        const userRef = ref(dbRealtime, "Drivers/" + driver.pinCode);
        update(userRef, { status: "Offline" })
            .then(() => {
                console.log("DriverStatus set to offline");
            })
            .then(() => {
                console.log("DriverStatus set to offline");
            })
            .catch((error) => {
                console.log("Error setting DriverStatus to offline: ", error);
            });
    };

    const handleSignOut = () => {
        logout();
        dispatch(resetDriver());
        // navigation.navigate("WelcomeScreen");
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

    return (
        <View style={styles.container}>
            {driver.isOnline ? (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {currentUserLocation ? (
                        <View style={styles.mainContainer}>
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
            ) : (
                <>
                    <TouchableOpacity onPress={() => handleSignOut()}>
                        <Text>Sign Out</Text>
                    </TouchableOpacity>
                    <View style={styles.buttonInner}>
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
                </>
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
    buttonInner: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    isOnlineSwitchText: {
        fontSize: 17,
        fontFamily: "SatoshiBlack",
        fontWeight: "500",
    },
    isOnlineSwitch: {
        marginVertical: 20,
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    },
});

export default DriverHomeScreen;
