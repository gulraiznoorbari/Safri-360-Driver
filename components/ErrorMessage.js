import { StyleSheet, Text, View } from "react-native";

const ErrorMessage = ({ errorMessage }) => {
    return (
        <View style={{ paddingHorizontal: 22, marginVertical: 10 }}>
            <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    errorText: {
        color: "red",
        fontSize: 14,
        fontWeight: "500",
    },
});

export default ErrorMessage;
