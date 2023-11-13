import { useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSelector } from "react-redux";

import { selectOrigin } from "../store/slices/navigationSlice";

const HomeMap = ({ initialPosition }) => {
    const mapRef = useRef(null);
    const origin = useSelector(selectOrigin);

    return (
        <MapView
            ref={mapRef}
            initialRegion={initialPosition}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            showsMyLocationButton={true}
            followsUserLocation={true}
        >
            {origin && <Marker coordinate={origin} />}
        </MapView>
    );
};

export default HomeMap;
