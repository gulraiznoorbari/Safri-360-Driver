import { useEffect, useState } from "react";
import { View, StyleSheet, Text, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "@react-navigation/native";
import { useDispatch } from "react-redux";

import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import { useFirebase } from "../contexts/FirebaseContext";
import { setUserType } from "../store/slices/userSlice";
import ClearableInput from "../components/ClearableInput";
import ErrorMessage from "../components/ErrorMessage";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import TransparentButton from "../components/Buttons/TransparentButton";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailErrMessage, setEmailErrMessage] = useState("");
    const [passwordErrMessage, setPasswordErrMessage] = useState("");

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
        setEmailErrMessage("");
        setPasswordErrMessage("");
    };

    const handleLogin = () => {
        if (!email) {
            setEmailErrMessage("Email address is required!");
            return;
        }
        if (!password) {
            setPasswordErrMessage("Password is required!");
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
                    setEmailErrMessage("Email address is invalid!");
                    setPasswordErrMessage("");
                } else if (error.code === "auth/wrong-password") {
                    setPasswordErrMessage("Wrong password");
                    setEmailErrMessage("");
                } else {
                    console.log(error);
                    setEmailErrMessage("User not Found.");
                    setPasswordErrMessage("");
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
                {emailErrMessage && <ErrorMessage errorMessage={emailErrMessage} />}

                <ClearableInput
                    label={"Password"}
                    placeholder={"Enter Password"}
                    value={password}
                    setValue={setPassword}
                    hideInput={true}
                    autoComplete={"password"}
                    textContentType={"password"}
                />
                {passwordErrMessage && <ErrorMessage errorMessage={passwordErrMessage} />}

                <Link to="/PasswordReset" style={styles.linkTextContainer}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                </Link>
                <PrimaryButton text={"Sign in"} action={() => handleLogin()} disabled={!(email && password)} />
                <TransparentButton text="Create new account" navigation={navigation} navigateTo={"SignUp"} />
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
