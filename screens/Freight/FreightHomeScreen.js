import { GOOGLE_MAPS_API_KEY } from "@env";
import { useState, useEffect } from "react";
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
import { ref, get, update } from "firebase/database";
import Geolocation from "react-native-geolocation-service";
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import { dbRealtime } from "../../firebase/config";
import { useMapContext } from "@contexts/MapContext";
import { requestLocationPermission } from "@utils/requestLocation";
import { selectFreightRider, setFreightRider } from "@store/slices/freightRiderSlice";
import { setOrigin, selectOrigin, setDestination } from "@store/slices/navigationSlice";
import { setCurrentUserLocation, selectCurrentUserLocation } from "@store/slices/locationSlice";
import { moveCameraToCenter } from "@utils/moveCameraToCenter";
import DrawerMenuButton from "@components/Buttons/DrawerMenuButton";
import LocateUserButton from "@components/Buttons/LocateUserButton";
import AvailableRequestsCards from "@components/Freight/AvailableRequestsCards";
import FreightBottomSheet from "@components/Freight/FreightBottomSheet";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.03;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const FreightHomeScreen = ({ navigation }) => {
    const { mapRef } = useMapContext();

    const dispatch = useDispatch();
    const freightRider = useSelector(selectFreightRider);
    const origin = useSelector(selectOrigin);
    const currentUserLocation = useSelector(selectCurrentUserLocation);
    const [region, setRegion] = useState({
        latitude: currentUserLocation ? currentUserLocation.latitude : 0,
        longitude: currentUserLocation ? currentUserLocation.longitude : 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    });

    useEffect(() => {
        dispatch(setOrigin(null));
        dispatch(setDestination(null));
        if (freightRider.isOnline) getLocation();

        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    useEffect(() => {
        if (freightRider.rideAssigned && currentUserLocation) {
            const freightRef = ref(dbRealtime, "Freight Riders/" + freightRider.uid);
            get(freightRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const freightData = snapshot.val();
                    if (
                        freightData.status === "accepted" ||
                        freightData.status === "ongoing" ||
                        freightData.status === "arrived"
                    ) {
                        dispatch(setFreightRider({ rideData: freightData }));
                    }
                }
            });
        }
    }, [freightRider.rideAssigned]);

    useEffect(() => {
        if (freightRider && !freightRider.rideAssigned) {
            if (freightRider.isOnline) {
                dispatch(setFreightRider({ isOnline: freightRider.isOnline }));
                riderIsOnline(freightRider.uid);
            } else {
                riderIsOffline(freightRider.uid);
            }
        }
    }, [freightRider.isOnline]);

    useEffect(() => {
        updateRiderLocation();
    }, [currentUserLocation]);

    const updateRiderLocation = async () => {
        const userRef = ref(dbRealtime, "Freight Riders/" + freightRider.uid);
        const locationName = await getLocationName(currentUserLocation.latitude, currentUserLocation.longitude);
        update(userRef, {
            location: {
                latitude: currentUserLocation.latitude,
                longitude: currentUserLocation.longitude,
                locationName: locationName,
            },
        })
            .then(() => {
                console.log("Freight Rider location updated");
            })
            .catch((error) => {
                console.log("Error updating Freight Rider location: ", error);
            });
    };

    const toggleSwitch = () => {
        const IsOnline = !freightRider.isOnline;
        dispatch(setFreightRider({ isOnline: IsOnline, status: IsOnline ? "Online" : "Offline" }));
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

    const riderIsOnline = (userUID) => {
        const userRef = ref(dbRealtime, "Freight Riders/" + userUID);
        update(userRef, { status: "Online" })
            .then(() => {
                console.log("Freight Rider Status set to online");
            })
            .catch((error) => {
                console.log("Error setting Freight Rider Status to online: ", error);
            });
    };

    const riderIsOffline = (userUID) => {
        const userRef = ref(dbRealtime, "Freight Riders/" + userUID);
        update(userRef, { status: "Offline" })
            .then(() => {
                console.log("Freight Rider Status set to offline");
            })
            .catch((error) => {
                console.log("Error setting Freight Rider Status to offline: ", error);
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
            {freightRider.isOnline ? (
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
                                    {freightRider.rideAssigned && freightRider.rideData && (
                                        <>
                                            <Marker
                                                coordinate={{
                                                    latitude: freightRider?.rideData?.origin.latitude,
                                                    longitude: freightRider?.rideData?.origin.longitude,
                                                }}
                                                pinColor="red"
                                            >
                                                <Callout>
                                                    <Text>{freightRider.rideData.origin.locationName}</Text>
                                                </Callout>
                                            </Marker>
                                            <Marker
                                                coordinate={{
                                                    latitude: freightRider?.rideData?.destination.latitude,
                                                    longitude: freightRider?.rideData?.destination.longitude,
                                                }}
                                                pinColor="#007ACC"
                                            >
                                                <Callout style={styles.callout}>
                                                    <Text>{freightRider.rideData.destination.locationName}</Text>
                                                </Callout>
                                            </Marker>
                                            <MapViewDirections
                                                origin={{
                                                    latitude: freightRider?.rideData?.origin.latitude,
                                                    longitude: freightRider?.rideData?.origin.longitude,
                                                }}
                                                destination={{
                                                    latitude: freightRider?.rideData?.destination.latitude,
                                                    longitude: freightRider?.rideData?.destination.longitude,
                                                }}
                                                apikey={GOOGLE_MAPS_API_KEY}
                                                strokeWidth={2}
                                                strokeColor="#000"
                                                optimizeWaypoints={true}
                                                onReady={(result) => centerCameraOnRoute(result)}
                                            />
                                        </>
                                    )}
                                    {origin && (!freightRider.rideAssigned || freightRider.rideCompleted) && (
                                        <Marker coordinate={origin} pinColor="#A7E92F" />
                                    )}
                                </MapView>
                                {mapRef?.current && <LocateUserButton userPosition={region} />}
                            </View>
                            {freightRider.rideAssigned ? (
                                <FreightBottomSheet />
                            ) : (
                                <View style={styles.overlayContainer}>
                                    <AvailableRequestsCards />
                                </View>
                            )}
                        </View>
                    </>
                </TouchableWithoutFeedback>
            ) : (
                <View style={styles.buttonInner}>
                    <Text style={styles.isOnlineSwitchText}>Go {freightRider.isOnline ? "Offline" : "Online"}</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#A7E92F" }}
                        thumbColor={freightRider.isOnline ? "#A7E92F" : "#767577"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={freightRider.isOnline}
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
    overlayContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
});

export default FreightHomeScreen;
