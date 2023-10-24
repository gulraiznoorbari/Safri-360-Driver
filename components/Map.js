import { GOOGLE_MAPS_API_KEY } from "@env";
import { StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useSelector } from "react-redux";

import { useMapContext } from "../contexts/MapContext";
import { selectCurrentUserLocation } from "../store/slices/locationSlice";
import { selectOrigin, selectDestination } from "../store/slices/navigationSlice";

const Map = ({ initialPosition }) => {
    const { mapRef, showDirection } = useMapContext();
    const currentUserLocation = useSelector(selectCurrentUserLocation);
    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);

    return (
        <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialPosition}
            showsUserLocation={true}
            showsMyLocationButton={true}
            zoomEnabled={true}
            zoomControlEnabled={false}
        >
            {origin && <Marker coordinate={origin} />}
            {destination && <Marker coordinate={destination} />}
            {origin && destination && showDirection && (
                <MapViewDirections
                    origin={origin}
                    destination={destination}
                    apikey={GOOGLE_MAPS_API_KEY}
                    mode="DRIVING"
                    strokeColor="#000"
                    strokeWidth={2}
                />
            )}
            {origin && currentUserLocation ? (
                <Circle
                    center={origin}
                    radius={100}
                    fillColor="rgba(255, 0, 0, 0.1)"
                    strokeColor="rgba(255, 0, 0, 0.4)"
                />
            ) : null}
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
});

export default Map;
