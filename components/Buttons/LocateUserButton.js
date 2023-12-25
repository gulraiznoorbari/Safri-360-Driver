import { StyleSheet, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { useMapContext } from "@contexts/MapContext";
import { moveCameraToCenter } from "@utils/moveCameraToCenter";

const LocateUserButton = ({ userPosition }) => {
    const { mapRef } = useMapContext();

    return (
        <TouchableOpacity style={styles.container} onPress={() => moveCameraToCenter(mapRef, userPosition)}>
            <MaterialIcons name="my-location" size={25} color="#3f3f3f" style={styles.icon} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 12,
        right: 14,
        shadowColor: "#000",
        borderRadius: 10,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 2,
        backgroundColor: "#fff",
    },
    icon: {
        padding: 5,
    },
});

export default LocateUserButton;
