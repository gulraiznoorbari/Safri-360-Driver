import { useEffect, useState } from "react";
import { View, StyleSheet, Text, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "@react-navigation/native";
import { useDispatch } from "react-redux";

import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import { useFirebase } from "../contexts/FirebaseContext";
import { setUserType } from "../store/slices/userTypeSlice";
import ClearableInput from "../components/ClearableInput";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import TransparentButton from "../components/Buttons/TransparentButton";
import { showError } from "../utils/ErrorHandlers";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { signIn } = useFirebase();
    const dispatch = useDispatch();

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            resetInputFields();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    const resetInputFields = () => {
        setEmail("");
        setPassword("");
    };

    const handleLogin = () => {
        if (!email) {
            showError("Email Address Required", "Please enter your email address.");
            return;
        }
        if (!password) {
            showError("Password Required", "Please enter your password.");
            return;
        }
        if (email && password) {
            const onSuccess = (credential) => {
                const user = credential.user;
                console.log("User: ", user);
                navigation.navigate("HomeScreen");
            };
            const onError = (error) => {
                if (error.code === "auth/invalid-email") {
                    showError("Invalid Email Address", "Please enter a valid email address.");
                    return;
                } else if (error.code === "auth/wrong-password") {
                    showError("Wrong Password", "Please enter the correct password.");
                    return;
                } else if (error.code === "auth/user-not-found") {
                    showError("User Not Found", "Please enter a valid email address.");
                    return;
                } else {
                    showError("Something went wrong.", "Please try again.");
                    return;
                }
            };
            signIn(email, password, onSuccess, onError);
        }
    };

    const restrictGoingBack = () => {
        dispatch(setUserType(null));
        return true;
    };

    return (
        <KeyboardAvoidingWrapper>
            <SafeAreaView>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Login</Text>
                </View>

                <ClearableInput
                    label={"Email address"}
                    placeholder={"Enter Email Address"}
                    value={email}
                    setValue={setEmail}
                    hideInput={false}
                    autoComplete={"email"}
                    textContentType={"emailAddress"}
                />
                <ClearableInput
                    label={"Password"}
                    placeholder={"Enter Password"}
                    value={password}
                    setValue={setPassword}
                    hideInput={true}
                    autoComplete={"password"}
                    textContentType={"password"}
                />

                <Link to="/PasswordReset" style={styles.linkTextContainer}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                </Link>
                <PrimaryButton text={"Sign in"} action={() => handleLogin()} disabled={!(email && password)} />
                <TransparentButton text="Create new account" navigation={navigation} navigateTo={"SignUpScreenNames"} />
            </SafeAreaView>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    headingContainer: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 10,
        marginVertical: 20,
    },
    headingText: {
        fontSize: 30,
        fontFamily: "SatoshiBlack",
        textAlign: "center",
        fontWeight: "600",
    },
    linkTextContainer: {
        textAlign: "right",
        marginLeft: "auto",
        marginHorizontal: 25,
        marginBottom: 10,
    },
    linkText: {
        fontFamily: "SatoshiMedium",
        fontSize: 14,
        fontWeight: "500",
        color: "#1b2607",
    },
});

export default LoginScreen;
