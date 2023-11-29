import { DEFAULT_PROFILE_IMAGE } from "@env";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Alert, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ref, set, push } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";

import { setUser, selectUser, selectUserType } from "../store/slices/userSlice";
import { useFirebase } from "../contexts/FirebaseContext";
import { dbRealtime } from "../firebase/config";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import ErrorMessage from "../components/ErrorMessage";
import ClearableInput from "../components/ClearableInput";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import TransparentButton from "../components/Buttons/TransparentButton";

const SignUpScreenCredentials = ({ navigation }) => {
    const dispatch = useDispatch();
    const userRedux = useSelector(selectUser);
    const userType = useSelector(selectUserType);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [errMessage, setErrMessage] = useState("");

    const { signUp } = useFirebase();

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            resetInputFields();
        });
        return unsubscribe;
    }, [navigation]);

    const restrictGoingBack = () => {
        Alert.alert("Hold on!", "Are you sure you want to go back?", [
            {
                text: "Cancel",
                onPress: () => null,
                style: "cancel",
            },
            { text: "YES", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
    };

    const validateEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailPattern.test(email);
    };

    const resetInputFields = () => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

    const AddToursToDB = (user) => {
        const userRef = ref(dbRealtime, "Tours/" + user.uid);
        set(userRef, {
            firstName: userRedux.firstName,
            lastName: userRedux.lastName,
            companyName: userRedux.companyName,
            userName: userRedux.userName,
            email: email,
            photoURL: DEFAULT_PROFILE_IMAGE,
            phoneNumber: "",
        })
            .then(() => {
                console.log("Tours Company added to DB");
            })
            .catch((error) => {
                console.log("Error adding user to DB: ", error);
            });
    };

    const AddRentACarToDB = (user) => {
        const userRef = ref(dbRealtime, "Rent A Car/" + user.uid);
        set(userRef, {
            firstName: userRedux.firstName,
            lastName: userRedux.lastName,
            companyName: userRedux.companyName,
            userName: userRedux.userName,
            email: email,
            photoURL: DEFAULT_PROFILE_IMAGE,
            phoneNumber: "",
        })
            .then(() => {
                const sharedKeyRef = push(ref(dbRealtime, "Shared/"));
                console.log("Shared ref: ", sharedKeyRef);
                set(sharedKeyRef, { userID: user.uid })
                    .then(() => {
                        console.log("Shared ref set with key: ", sharedKeyRef.key);
                        console.log("User added to DB");
                    })
                    .catch((error) => {
                        console.log("Error setting shared ref: ", error);
                    });
            })
            .catch((error) => {
                console.log("Error adding user to DB: ", error);
            });
    };

    const handleSignup = () => {
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");

        let isValid = true;

        if (!validateEmail(email)) {
            setEmailError("Invalid email address");
            isValid = false;
        }
        if (password.length < 6) {
            setPasswordError("Password should be at least 6 characters");
            isValid = false;
        }
        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            isValid = false;
        }
        if (isValid) {
            const onSuccess = (credential) => {
                const user = credential.user;
                userType === "RentACarOwner"
                    ? AddRentACarToDB(user)
                    : userType === "ToursCompany" && AddToursToDB(user);
                navigation.navigate("PhoneRegisterScreen");
            };
            const onError = (error) => {
                if (error.code === "auth/email-already-in-use") {
                    setErrMessage("That email address is already in use");
                } else {
                    console.log(error);
                    setErrMessage("Something went wrong, try again.");
                }
            };
            dispatch(
                setUser({
                    email: email,
                    photoURL: DEFAULT_PROFILE_IMAGE,
                }),
            );
            signUp(email, password, onSuccess, onError);
        }
    };

    return (
        <KeyboardAvoidingWrapper>
            <SafeAreaView>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Sign Up</Text>
                </View>

                <ClearableInput
                    label={"Email"}
                    placeholder={"Enter Email"}
                    value={email}
                    setValue={setEmail}
                    hideInput={false}
                    autoComplete={"email"}
                    textContentType={"emailAddress"}
                />
                {emailError && <ErrorMessage errorMessage={emailError} />}

                <ClearableInput
                    label={"Password"}
                    placeholder={"Enter Password"}
                    value={password}
                    setValue={setPassword}
                    hideInput={true}
                    autoComplete={"password"}
                    textContentType={"password"}
                />
                {passwordError && <ErrorMessage errorMessage={passwordError} />}

                <ClearableInput
                    label={"Confirm Password"}
                    placeholder={"Re-enter Password"}
                    value={confirmPassword}
                    setValue={setConfirmPassword}
                    hideInput={true}
                    autoComplete={"password"}
                    textContentType={"password"}
                />
                {confirmPasswordError && <ErrorMessage errorMessage={confirmPasswordError} />}

                {errMessage && <ErrorMessage errorMessage={errMessage} />}

                <PrimaryButton
                    text={"Next"}
                    action={() => handleSignup()}
                    disabled={!(email && password && confirmPassword)}
                />
                <TransparentButton text="Already have an account" navigation={navigation} navigateTo={"Login"} />
            </SafeAreaView>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    headingContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        marginVertical: 20,
    },
    headingText: {
        fontSize: 30,
        fontFamily: "SatoshiBlack",
        textAlign: "center",
        fontWeight: "600",
    },
});

export default SignUpScreenCredentials;
