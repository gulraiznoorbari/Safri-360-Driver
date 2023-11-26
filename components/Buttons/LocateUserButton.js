import { StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { moveCameraToCenter } from "../../utils/moveCameraToCenter";

const LocateUserButton = ({ mapRef, userPosition }) => {
    return (
        <View>
            <TouchableOpacity style={styles.container} onPress={() => moveCameraToCenter(mapRef, userPosition)}>
                <Ionicons name="navigate-outline" size={30} color="black" style={styles.icon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 12,
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
        padding: 4,
    },
});

export default LocateUserButton;
