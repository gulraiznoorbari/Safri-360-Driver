import { DEFAULT_PROFILE_IMAGE } from "@env";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Alert, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ref, set, push } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";

import { setRentACarUser, selectRentACarUser } from "../store/slices/rentACarSlice";
import { setTourUser, selectTourUser } from "../store/slices/tourSlice";
import { setFreightRider, selectFreightRider } from "../store/slices/freightRiderSlice";
import { selectUserType } from "../store/slices/userTypeSlice";
import { useFirebase } from "../contexts/FirebaseContext";
import { dbRealtime } from "../firebase/config";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import ClearableInput from "../components/ClearableInput";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import TransparentButton from "../components/Buttons/TransparentButton";
import { showError } from "../utils/ErrorHandlers";

const SignUpScreenCredentials = ({ navigation }) => {
    const dispatch = useDispatch();
    const rentACarUser = useSelector(selectRentACarUser);
    const toursUser = useSelector(selectTourUser);
    const freightRider = useSelector(selectFreightRider);
    const userType = useSelector(selectUserType);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
            firstName: toursUser.firstName,
            lastName: toursUser.lastName,
            companyName: toursUser.companyName,
            userName: toursUser.userName,
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
            firstName: rentACarUser.firstName,
            lastName: rentACarUser.lastName,
            companyName: rentACarUser.companyName,
            userName: rentACarUser.userName,
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

    const AddFreightRiderToDB = (user) => {
        const userRef = ref(dbRealtime, "Freight Riders/" + user.uid);
        set(userRef, {
            firstName: freightRider.firstName,
            lastName: freightRider.lastName,
            userName: freightRider.userName,
            email: email,
            photoURL: DEFAULT_PROFILE_IMAGE,
            phoneNumber: "",
            CNIC: freightRider.CNIC,
            vehicleType: freightRider.vehicleInfo.vehicleType,
            vehicleAverage: freightRider.vehicleInfo.carAverage,
            vehicleRegistrationNumber: freightRider.vehicleInfo.carRegistrationNumber,
        })
            .then(() => {
                console.log("Freight Rider added to DB");
            })
            .catch((error) => {
                console.log("Error adding user to DB: ", error);
            });
    };

    const handleSignup = () => {
        if (!validateEmail(email)) {
            showError("Invalid Email Address", "Please try again with a valid email address.");
            return;
        }
        if (password.length < 6) {
            showError("Invalid Password", "Password should be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            showError("Passwords do not match", "Please try again.");
            return;
        }
        const onSuccess = (credential) => {
            const user = credential.user;
            userType === "RentACarOwner"
                ? AddRentACarToDB(user)
                : userType === "ToursCompany"
                ? AddToursToDB(user)
                : userType === "FreightRider" && AddFreightRiderToDB(user);
            navigation.navigate("PhoneRegisterScreen");
        };
        const onError = (error) => {
            if (error.code === "auth/email-already-in-use") {
                showError("Email already in use", "Please try again with a different email address.");
            } else {
                console.log(error);
                showError("Something went wrong", "Please try again.");
            }
        };
        userType === "RentACarOwner"
            ? dispatch(setRentACarUser({ email: email, photoURL: DEFAULT_PROFILE_IMAGE }))
            : userType === "ToursCompany"
            ? dispatch(setTourUser({ email: email, photoURL: DEFAULT_PROFILE_IMAGE }))
            : userType === "FreightRider" &&
              dispatch(setFreightRider({ email: email, photoURL: DEFAULT_PROFILE_IMAGE }));
        signUp(email, password, onSuccess, onError);
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
                <ClearableInput
                    label={"Password"}
                    placeholder={"Enter Password"}
                    value={password}
                    setValue={setPassword}
                    hideInput={true}
                    autoComplete={"password"}
                    textContentType={"password"}
                />
                <ClearableInput
                    label={"Confirm Password"}
                    placeholder={"Re-enter Password"}
                    value={confirmPassword}
                    setValue={setConfirmPassword}
                    hideInput={true}
                    autoComplete={"password"}
                    textContentType={"password"}
                />
                <PrimaryButton
                    text={"Next"}
                    action={() => handleSignup()}
                    disabled={!(email && password && confirmPassword)}
                />
                {userType !== "FreightRider" && (
                    <TransparentButton text="Already have an account" navigation={navigation} navigateTo={"Login"} />
                )}
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
