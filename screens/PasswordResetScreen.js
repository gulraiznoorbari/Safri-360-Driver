import { useState, useLayoutEffect } from "react";
import { StyleSheet, Text, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

import { useFirebase } from "../contexts/FirebaseContext";
import ErrorMessage from "../components/ErrorMessage";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import ClearableInput from "../components/ClearableInput";
import TransparentButton from "../components/Buttons/TransparentButton";

const PasswordResetScreen = ({ navigation }) => {
    const { sendPasswordResetMail, currentUser } = useFirebase();
    const [errMessage, setErrMessage] = useState("");
    const [email, setEmail] = useState(currentUser ? currentUser.email : "");

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Reset Password",
            headerTitleStyle: {
                fontSize: 20,
                fontFamily: "SatoshiBold",
                fontWeight: "600",
            },
            headerTitleAlign: "center",
            headerStyle: {
                height: 60,
            },
        });
    }, [navigation]);

    const handleResetPassword = () => {
        if (!email) {
            setErrMessage("Email address is required!");
            return;
        }
        if (email) {
            const onSuccess = () => {
                console.log("Password reset email sent successfully");
                navigation.navigate("Login");
            };
            const onError = (error) => {
                console.log("Error sending password reset email: ", error);
                setErrMessage(error.code);
            };
            sendPasswordResetMail(email, onSuccess, onError);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Text style={styles.infoText}>
                    Enter the email address associated with your account and we'll send you a link to reset your
                    password.
                </Text>

                <ClearableInput
                    label={"Email address"}
                    placeholder={"Enter Email Address"}
                    value={email}
                    setValue={setEmail}
                    hideInput={false}
                    autoComplete={"email"}
                    textContentType={"emailAddress"}
                />
                {errMessage && <ErrorMessage message={errMessage} marginVertical={10} />}

                {email ? (
                    <PrimaryButton text={"Reset Password"} action={() => handleResetPassword()} disabled={false} />
                ) : (
                    <PrimaryButton text={"Reset Password"} action={() => handleResetPassword()} disabled={true} />
                )}
                <TransparentButton
                    text="Don't have an account? Sign up"
                    navigation={navigation}
                    navigateTo={"SignUp"}
                />
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    infoText: {
        marginHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 25,
        fontSize: 16,
        fontWeight: "500",
        fontFamily: "SatoshiBold",
    },
    SignupOptionContainer: {
        alignItems: "center",
        marginTop: 10,
    },
    SignupOptionText: {
        fontSize: 14,
        color: "#2e2e2d",
    },
    linkText: {
        fontFamily: "Satoshi",
        fontSize: 14,
        fontWeight: "500",
        color: "#1b2607",
    },
});

export default PasswordResetScreen;
