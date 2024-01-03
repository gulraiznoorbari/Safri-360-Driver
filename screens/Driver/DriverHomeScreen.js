import { GOOGLE_MAPS_API_KEY } from "@env";
import { useState, useEffect, useLayoutEffect } from "react";
import {
    StyleSheet,
    Dimensions,
    Text,
    View,
    Alert,
    Switch,
    Keyboard,
    BackHandler,
    TouchableWithoutFeedback,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { ref, get, update, onValue } from "firebase/database";
import Geolocation from "react-native-geolocation-service";
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import { dbRealtime } from "../../firebase/config";
import { useMapContext } from "@contexts/MapContext";
import { requestLocationPermission } from "@utils/requestLocation";
import { selectDriver, setDriver } from "@store/slices/driverSlice";
import { setOrigin, selectOrigin, setDestination } from "@store/slices/navigationSlice";
import { setCurrentUserLocation, selectCurrentUserLocation } from "@store/slices/locationSlice";
import DrawerMenuButton from "@components/Buttons/DrawerMenuButton";
import LocateUserButton from "@components/Buttons/LocateUserButton";
import { moveCameraToCenter } from "@utils/moveCameraToCenter";
import DriverBottomSheet from "@components/Driver/DriverBottomSheet";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.03;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const DriverHomeScreen = ({ navigation }) => {
    const { mapRef } = useMapContext();

    const currentUserLocation = useSelector(selectCurrentUserLocation);
    const origin = useSelector(selectOrigin);
    const driver = useSelector(selectDriver);
    const dispatch = useDispatch();
    const driverPIN = driver?.pinCode;

    const [region, setRegion] = useState({
        latitude: currentUserLocation ? currentUserLocation.latitude : 0,
        longitude: currentUserLocation ? currentUserLocation.longitude : 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    });

    useLayoutEffect(() => {
        if (driver.firstName === null && driver.lastName === null && driver.CNIC === null) {
            navigation.navigate("DriverInfoInput");
        }
    }, [navigation]);

    useEffect(() => {
        dispatch(setOrigin(null));
        dispatch(setDestination(null));
        if (driver.isOnline) {
            getLocation();
            const driverRef = ref(dbRealtime, "Drivers/" + driverPIN);
            get(driverRef).then((snapshot) => {
                const driverData = snapshot.val();
                dispatch(
                    setDriver({
                        rating: parseInt(driverData.ratings.rating),
                        totalRatings: parseInt(driverData.ratings.totalRatings),
                    }),
                );
            });
        }
        if (currentUserLocation) {
            const driverRef = ref(dbRealtime, "Drivers/" + driverPIN);
            onValue(driverRef, (snapshot) => {
                const driverData = snapshot.val();
                if (driverData.status === "booked") {
                    const assignedRideRef = ref(dbRealtime, "Rides/" + driverData.assignedRideID);
                    get(assignedRideRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            const rideData = snapshot.val();
                            dispatch(setDriver({ rideData: rideData, rideAssigned: true }));
                        }
                    });
                }
            });
        }

        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    useEffect(() => {
        if (driver.rideAssigned && currentUserLocation) {
            const driverRef = ref(dbRealtime, "Drivers/" + driverPIN);
            onValue(driverRef, (snapshot) => {
                const driverData = snapshot.val();
                if (
                    driverData.status === "booked" ||
                    driverData.status === "arrived" ||
                    driverData.status === "ongoing"
                ) {
                    const assignedRideRef = ref(dbRealtime, "Rides/" + driverData.assignedRideID);
                    get(assignedRideRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            const rideData = snapshot.val();
                            dispatch(setDriver({ rideData: rideData, rideAssigned: true }));
                        }
                    });
                }
            });
        }
    }, [driver.rideAssigned]);

    useEffect(() => {
        if (driverPIN && !driver.rideAssigned) {
            if (driver.isOnline) {
                dispatch(setDriver({ isOnline: driver.isOnline }));
                driverIsOnline(driverPIN);
            } else {
                driverIsOffline(driverPIN);
            }
        }
    }, [driver.isOnline]);

    useEffect(() => {
        updateDriverLocation();
    }, [currentUserLocation]);

    const updateDriverLocation = async () => {
        const userRef = ref(dbRealtime, "Drivers/" + driverPIN);
        const locationName = await getLocationName(currentUserLocation.latitude, currentUserLocation.longitude);
        update(userRef, {
            location: {
                latitude: currentUserLocation.latitude,
                longitude: currentUserLocation.longitude,
                locationName: locationName,
            },
        })
            .then(() => {
                console.log("Driver location updated");
            })
            .catch((error) => {
                console.log("Error updating driver location: ", error);
            });
    };

    const toggleSwitch = () => {
        const IsOnline = !driver.isOnline;
        dispatch(setDriver({ isOnline: IsOnline, status: IsOnline ? "Online" : "Offline" }));
    };

    const getLocation = async () => {
        const hasLocationPermission = await requestLocationPermission();
        if (hasLocationPermission) {
            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    dispatch(setOrigin({ latitude: latitude, longitude: longitude }));
                    dispatch(setCurrentUserLocation({ latitude, longitude }));
                    moveCameraToCenter(mapRef, position.coords);
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
            );
        }
    };

    const getLocationName = async (latitude, longitude) => {
        const apiKey = GOOGLE_MAPS_API_KEY;
        const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const address = data?.results[0].formatted_address;
                return address;
            } else {
                throw new Error("Unable to get location name");
            }
        } catch (error) {
            console.error("Error fetching location name:", error.message);
            throw error;
        }
    };

    const driverIsOnline = (driverPIN) => {
        const userRef = ref(dbRealtime, "Drivers/" + driverPIN);
        update(userRef, { status: "Online" })
            .then(() => {
                console.log("DriverStatus set to online");
            })
            .catch((error) => {
                console.log("Error setting DriverStatus to online: ", error);
            });
    };

    const driverIsOffline = (driverPIN) => {
        const userRef = ref(dbRealtime, "Drivers/" + driverPIN);
        update(userRef, { status: "Offline" })
            .then(() => {
                console.log("DriverStatus set to offline");
            })
            .catch((error) => {
                console.log("Error setting DriverStatus to offline: ", error);
            });
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

    const centerCameraOnRoute = (result) => {
        mapRef.current.fitToCoordinates(result.coordinates, {
            edgePadding: {
                right: width / 20,
                bottom: height / 20,
                left: width / 20,
                top: height / 20,
            },
            animated: true,
        });
    };

    return (
        <View style={styles.container}>
            {driver.isOnline ? (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <>
                        <DrawerMenuButton action={openDrawerMenu} />
                        <View style={styles.mainContainer}>
                            <View style={styles.mapContainer}>
                                <MapView
                                    ref={mapRef}
                                    region={region}
                                    style={styles.map}
                                    provider={PROVIDER_GOOGLE}
                                    showsUserLocation={true}
                                    showsMyLocationButton={false}
                                    followsUserLocation={true}
                                    loadingEnabled={true}
                                    loadingIndicatorColor="#A7E92F"
                                    loadingBackgroundColor="#fff"
                                >
                                    {driver.rideAssigned && driver.rideData && (
                                        <>
                                            <Marker
                                                coordinate={{
                                                    latitude: driver.rideData.origin.latitude,
                                                    longitude: driver.rideData.origin.longitude,
                                                }}
                                                pinColor="red"
                                            >
                                                <Callout style={styles.callout}>
                                                    <Text>{driver.rideData.origin.locationName}</Text>
                                                </Callout>
                                            </Marker>
                                            <Marker
                                                coordinate={{
                                                    latitude: driver.rideData.destination.latitude,
                                                    longitude: driver.rideData.destination.longitude,
                                                }}
                                                pinColor="#007ACC"
                                            >
                                                <Callout style={styles.callout}>
                                                    <Text>{driver.rideData.destination.locationName}</Text>
                                                </Callout>
                                            </Marker>
                                            <MapViewDirections
                                                origin={{
                                                    latitude: driver.rideData.origin.latitude,
                                                    longitude: driver.rideData.origin.longitude,
                                                }}
                                                destination={{
                                                    latitude: driver.rideData.destination.latitude,
                                                    longitude: driver.rideData.destination.longitude,
                                                }}
                                                apikey={GOOGLE_MAPS_API_KEY}
                                                strokeWidth={2}
                                                strokeColor="#000"
                                                optimizeWaypoints={true}
                                                onReady={(result) => centerCameraOnRoute(result)}
                                            />
                                        </>
                                    )}
                                    {origin && (!driver.rideAssigned || driver.rideCompleted || !driver.rideData) && (
                                        <Marker coordinate={origin} pinColor="#A7E92F" />
                                    )}
                                </MapView>
                                {mapRef?.current && <LocateUserButton userPosition={region} />}
                            </View>
                            <DriverBottomSheet />
                        </View>
                    </>
                </TouchableWithoutFeedback>
            ) : (
                <>
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
    callout: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 10,
    },
    calloutText: {
        fontSize: 16,
        fontFamily: "SatoshiMedium",
    },
});

export default DriverHomeScreen;
