import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { ref, onValue } from "firebase/database";

import { dbRealtime } from "../firebase/config";
import { useMapContext } from "@contexts/MapContext";
import { selectRentACarUser } from "@store/slices/rentACarSlice";
import { selectOrigin } from "@store/slices/navigationSlice";
import { humanPhoneNumber } from "@utils/humanPhoneNumber";
import LocateUserButton from "./Buttons/LocateUserButton";

const HomeMap = ({ initialPosition }) => {
    const [drivers, setDrivers] = useState([]);

    const { mapRef } = useMapContext();
    const user = useSelector(selectRentACarUser);
    const origin = useSelector(selectOrigin);

    useEffect(() => {
        const driversRef = ref(dbRealtime, "Drivers");
        onValue(driversRef, (snapshot) => {
            if (snapshot.exists()) {
                const driversData = snapshot.val();
                let matchingDrivers = [];
                const driversArray = Object.values(driversData);
                driversArray.forEach((driver) => {
                    if (driver.RentACarUID === user.uid) {
                        matchingDrivers.push(driver);
                    }
                });
                setDrivers(matchingDrivers);
            } else {
                setDrivers([]);
                console.log("No data available");
            }
        });
    }, []);

    const getMarkerColor = (status) => {
        switch (status.toLowerCase()) {
            case "booked":
                return "red";
            case "offline":
                return "gray";
            case "online":
                return "green";
            default:
                return "black";
        }
    };

    return (
        <>
            <MapView
                ref={mapRef}
                initialRegion={initialPosition}
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
                showsMyLocationButton={false}
                loadingEnabled={true}
                loadingIndicatorColor="#A7E92F"
                loadingBackgroundColor="#FFF"
            >
                {origin && <Marker coordinate={origin} pinColor={"#A7E92F"} />}
                {drivers.map(
                    (driver, index) =>
                        driver.location && (
                            <Marker
                                key={index}
                                coordinate={{
                                    latitude: driver.location.latitude,
                                    longitude: driver.location.longitude,
                                }}
                            >
                                <MaterialIcons
                                    name="location-history"
                                    size={35}
                                    color={getMarkerColor(driver.status)}
                                    style={{
                                        borderRadius: 50,
                                        backgroundColor: "#fff",
                                    }}
                                />
                                <Callout style={styles.calloutContainer}>
                                    <View style={styles.callout}>
                                        <Text style={styles.driverName}>
                                            {driver.firstName} {driver.lastName}
                                        </Text>
                                        <Text style={styles.driverPhoneNumber}>
                                            {humanPhoneNumber(driver.phoneNumber)}
                                        </Text>
                                        <Text style={[styles.driverStatus, { color: getMarkerColor(driver.status) }]}>
                                            {driver.status}
                                        </Text>
                                    </View>
                                </Callout>
                            </Marker>
                        ),
                )}
            </MapView>
            {mapRef.current && <LocateUserButton userPosition={initialPosition} />}
        </>
    );
};

const styles = StyleSheet.create({
    calloutContainer: {
        minHeight: "100%",
        minWidth: "100%",
    },
    callout: {
        width: 120,
        height: 70,
        padding: 5,
        flexDirection: "column",
        justifyContent: "space-evenly",
        backgroundColor: "#FFF",
    },
    driverName: {
        fontSize: 13,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "left",
    },
    driverPhoneNumber: {
        fontSize: 12,
        fontFamily: "SatoshiMedium",
        fontWeight: "500",
        textAlign: "left",
    },
    driverStatus: {
        fontSize: 13,
        fontFamily: "SatoshiBlack",
        fontWeight: "500",
        textAlign: "left",
        textTransform: "uppercase",
    },
});

export default HomeMap;
