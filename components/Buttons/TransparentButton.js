import { StyleSheet, Text, TouchableOpacity } from "react-native";

const TransparentButton = ({ navigation, text, navigateTo }) => {
    return (
        <TouchableOpacity onPress={() => navigation.navigate(navigateTo)} style={styles.buttonContainer}>
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        padding: 15,
        marginBottom: 20,
    },
    buttonText: {
        fontFamily: "SatoshiBold",
        color: "#000",
        textAlign: "center",
        fontSize: 14,
    },
});

export default TransparentButton;
