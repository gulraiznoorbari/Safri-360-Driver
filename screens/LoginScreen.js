import { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "@react-navigation/native";
import { ref, get } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";

import KeyboardAvoidingWrapper from "@components/KeyboardAvoidingWrapper";
import { dbRealtime } from "../firebase/config";
import { useFirebase } from "@contexts/FirebaseContext";
import { setUserType, selectUserType } from "@store/slices/userTypeSlice";
import { setRentACarUser } from "@store/slices/rentACarSlice";
import { setTourUser } from "@store/slices/tourSlice";
import { setFreightRider } from "@store/slices/freightRiderSlice";
import ClearableInput from "@components/ClearableInput";
import PrimaryButton from "@components/Buttons/PrimaryButton";
import TransparentButton from "@components/Buttons/TransparentButton";
import { showError } from "@utils/ErrorHandlers";

const LoginScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { signIn, updateUserProfile } = useFirebase();
    const userType = useSelector(selectUserType);
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
        setLoading(true);
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
                userType === "RentACarOwner"
                    ? get(ref(dbRealtime, "Rent A Car/" + credential.user.uid))
                          .then((snapshot) => {
                              const rentACarData = snapshot.val();
                              dispatch(
                                  setRentACarUser({
                                      uid: credential.user.uid,
                                      firstName: rentACarData.firstName,
                                      lastName: rentACarData.lastName,
                                      companyName: rentACarData.companyName,
                                      userName: rentACarData.firstName,
                                      email: rentACarData.email,
                                      phoneNumber: rentACarData.phoneNumber,
                                      photoURL: rentACarData.photoURL,
                                      phoneNumberVerified: rentACarData.phoneNumber ? true : false,
                                      isLoggedIn: true,
                                      lastLoginAt: credential.user.metadata.lastSignInTime,
                                  }),
                              );
                              updateUserProfile({
                                  displayName: rentACarData.firstName,
                                  photoURL: rentACarData.photoURL,
                                  phoneNumber: rentACarData.phoneNumber,
                                  phoneNumberVerified: rentACarData.phoneNumber ? true : false,
                              });
                              setTimeout(() => {
                                  navigation.navigate("HomeScreen");
                              }, 500);
                          })
                          .finally(() => setLoading(false))
                    : userType === "ToursCompany"
                    ? get(ref(dbRealtime, "Tours/" + credential.user.uid))
                          .then((snapshot) => {
                              const tourData = snapshot.val();
                              dispatch(
                                  setTourUser({
                                      uid: credential.user.uid,
                                      firstName: tourData.firstName,
                                      lastName: tourData.lastName,
                                      companyName: tourData.companyName,
                                      userName: tourData.firstName,
                                      email: tourData.email,
                                      phoneNumber: tourData.phoneNumber,
                                      photoURL: tourData.photoURL,
                                      phoneNumberVerified: tourData.phoneNumber ? true : false,
                                      isLoggedIn: true,
                                      lastLoginAt: credential.user.metadata.lastSignInTime,
                                  }),
                              );
                              updateUserProfile({
                                  displayName: tourData.firstName,
                                  photoURL: tourData.photoURL,
                                  phoneNumber: tourData.phoneNumber,
                                  phoneNumberVerified: tourData.phoneNumber ? true : false,
                              });
                              setTimeout(() => {
                                  navigation.navigate("HomeScreen");
                              }, 500);
                          })
                          .finally(() => setLoading(false))
                    : userType === "FreightRider" &&
                      get(ref(dbRealtime, "Freight Riders/" + credential.user.uid))
                          .then((snapshot) => {
                              const freightRiderData = snapshot.val();
                              dispatch(
                                  setFreightRider({
                                      uid: credential.user.uid,
                                      CNIC: freightRiderData.CNIC,
                                      firstName: freightRiderData.firstName,
                                      lastName: freightRiderData.lastName,
                                      userName: freightRiderData.firstName,
                                      email: freightRiderData.email,
                                      phoneNumber: freightRiderData.phoneNumber,
                                      photoURL: freightRiderData.photoURL,
                                      phoneNumberVerified: freightRiderData.phoneNumber ? true : false,
                                      isLoggedIn: true,
                                      lastLoginAt: credential.user.metadata.lastSignInTime,
                                      vehicleInfo: {
                                          vehicleType: freightRiderData.vehicleType,
                                          vehicleAverage: freightRiderData.carAverage,
                                          vehicleRegistrationNumber: freightRiderData.carRegistrationNumber,
                                      },
                                  }),
                              );
                              updateUserProfile({
                                  displayName: freightRiderData.firstName,
                                  photoURL: freightRiderData.photoURL,
                                  phoneNumber: freightRiderData.phoneNumber,
                                  phoneNumberVerified: freightRiderData.phoneNumber ? true : false,
                              });
                              setTimeout(() => {
                                  navigation.navigate("HomeScreen");
                              }, 500);
                          })
                          .finally(() => setLoading(false));
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
                {loading && (
                    <ActivityIndicator
                        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                        size="large"
                        color="#000"
                    />
                )}
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
