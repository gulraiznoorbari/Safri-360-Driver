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
    PermissionsAndroid,
    TouchableWithoutFeedback,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { ref, update } from "firebase/database";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Geolocation from "react-native-geolocation-service";

import { dbRealtime, geoFire } from "../../firebase/config";
import { useMapContext } from "../../contexts/MapContext";
import { selectDriver, setDriver } from "../../store/slices/driverSlice";
import { setOrigin, selectOrigin, setDestination } from "../../store/slices/navigationSlice";
import { setCurrentUserLocation, selectCurrentUserLocation } from "../../store/slices/locationSlice";
import DrawerMenuButton from "../../components/Buttons/DrawerMenuButton";
import LocateUserButton from "../../components/Buttons/LocateUserButton";
import { moveCameraToCenter } from "../../utils/moveCameraToCenter";
import DriverBottomSheet from "../../components/DriverBottomSheet";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.03;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const DriverHomeScreen = ({ navigation }) => {
    const [tracking, setTracking] = useState(false);
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
        if (driver.isOnline) getLocation();

        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    useEffect(() => {
        if (driver.isOnline) {
            dispatch(setDriver({ isOnline: driver.isOnline }));
            driverIsOnline(driverPIN);
        } else {
            driverIsOffline(driverPIN);
        }
    }, [driver.isOnline]);

    const toggleSwitch = () => {
        const IsOnline = !driver.isOnline;
        dispatch(setDriver({ isOnline: IsOnline, status: IsOnline ? "Online" : "Offline" }));
    };

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
                    dispatch(setOrigin({ latitude: latitude, longitude: longitude }));
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

    return (
        <View style={styles.container}>
            {driver.isOnline ? (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <>
                        <DrawerMenuButton action={() => openDrawerMenu()} />
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
                                    {currentUserLocation && origin && <Marker coordinate={origin} />}
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
});

export default DriverHomeScreen;
