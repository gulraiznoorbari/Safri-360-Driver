import { StyleSheet, Text, View } from "react-native";

import PrimaryButton from "../components/Buttons/PrimaryButton";

const WelcomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.mainHeadingContainer}>
                <Text style={styles.heading}>Welcome to </Text>
                <Text style={styles.logoHeading}>Safri 360</Text>
                <Text style={styles.logoHeading}>Driver</Text>
            </View>
            <View style={styles.buttonsContainer}>
                <Text style={styles.subHeading}>Get Started as a</Text>
                <PrimaryButton
                    text="Rent A Car Owner"
                    action={() => {
                        navigation.navigate("Login");
                    }}
                    disabled={false}
                    buttonStyle={{
                        backgroundColor: "#A7E92F",
                        padding: 20,
                        borderRadius: 10,
                    }}
                />
                <PrimaryButton
                    text="Driver"
                    action={() => {
                        navigation.navigate("Login");
                    }}
                    disabled={false}
                    buttonStyle={{
                        backgroundColor: "#A7E92F",
                        padding: 20,
                        borderRadius: 10,
                    }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        justifyContent: "space-between",
    },
    mainHeadingContainer: {
        flex: 1,
        paddingTop: 60,
        alignItems: "center",
    },
    heading: {
        fontSize: 28,
        textAlign: "center",
        fontFamily: "SatoshiBold",
    },
    logoHeading: {
        fontSize: 42,
        textAlign: "center",
        fontFamily: "SatoshiBlack",
    },
    buttonsContainer: {
        flex: 1,
        justifyContent: "flex-end",
        paddingBottom: 10,
    },
    subHeading: {
        paddingTop: 20,
        paddingBottom: 10,
        paddingHorizontal: 40,
        fontSize: 18,
        fontFamily: "Satoshi",
        textAlign: "center",
    },
});

export default WelcomeScreen;
