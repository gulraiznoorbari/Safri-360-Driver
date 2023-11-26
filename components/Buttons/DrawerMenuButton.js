import { StyleSheet, Pressable } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const DrawerMenuButton = ({ action }) => {
    return (
        <Pressable style={styles.container} onPress={action}>
            <Ionicons name="menu" size={30} color="black" style={styles.icon} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 12,
        left: 14,
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

export default DrawerMenuButton;
