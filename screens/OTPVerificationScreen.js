import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, TextInput, Pressable, BackHandler, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PhoneAuthProvider, linkWithCredential, getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, set, child } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";

import { FirebaseRecaptchaVerifierModal } from "@components/firebase-recaptcha/modal";
import { useFirebase } from "@contexts/FirebaseContext";
import firebaseConfig, { dbRealtime } from "../firebase/config";
import { selectRentACarUser, setRentACarUser } from "@store/slices/rentACarSlice";
import { selectTourUser, setTourUser } from "@store/slices/tourSlice";
import { selectFreightRider, setFreightRider } from "@store/slices/freightRiderSlice";
import { selectUserType } from "@store/slices/userTypeSlice";
import { humanPhoneNumber } from "@utils/humanPhoneNumber";
import KeyboardAvoidingWrapper from "@components/KeyboardAvoidingWrapper";
import PrimaryButton from "@components/Buttons/PrimaryButton";
import { showError } from "@utils/ErrorHandlers";

const OTPVerificationScreen = ({ navigation }) => {
    const CODE_LENGTH = 6;
    const { sendPhoneVerificationCode, updateUserProfile } = useFirebase();
    const dispatch = useDispatch();
    const rentACarUser = useSelector(selectRentACarUser);
    const toursUser = useSelector(selectTourUser);
    const freightRider = useSelector(selectFreightRider);
    const userType = useSelector(selectUserType);
    const phoneNumber =
        userType === "RentACarOwner"
            ? rentACarUser.phoneNumber
            : userType === "ToursCompany"
            ? toursUser.phoneNumber
            : userType === "FreightRider" && freightRider.phoneNumber;

    const [currentUser, setCurrentUser] = useState(null);
    const [code, setCode] = useState([...Array(CODE_LENGTH)]);
    const [verificationId, setVerificationId] = useState();
    const [verificationSent, setVerificationSent] = useState(false);
    const [isDisabled, setDisabled] = useState(true);
    const [textFocus, setTextFocus] = useState(false);

    const recaptchaVerifier = useRef(null);
    const codeRefs = useRef([]);
    codeRefs.current = [];

    useEffect(() => {
        console.log("currentUser: ", currentUser);
        console.log("OTPVerificationScreen loaded");
        if (!phoneNumber) {
            showError("Something went wrong", "Phone number was not found.");
            return;
        }
        if (!verificationSent) {
            sendVerificationCode();
        }
        onAuthStateChanged(getAuth(), (user) => {
            setCurrentUser(user);
        });
        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    const addToRef = (element) => {
        if (element && !codeRefs.current.includes(element)) {
            codeRefs.current.push(element);
        }
    };

    const AddPhoneNumberToDB = (user, DBNode) => {
        const userRef = ref(dbRealtime, `${DBNode}/` + user.uid);
        const phoneNumberRef = child(userRef, "phoneNumber");
        set(phoneNumberRef, phoneNumber)
            .then(() => {
                console.log("Phone number added to DB");
            })
            .catch((error) => {
                console.log("Error adding phone number to DB: ", error);
            });
    };

    const handleInputCode = (value, index) => {
        const next = index < CODE_LENGTH - 1 ? index + 1 : index;
        const prev = index > 0 ? index - 1 : index;

        const updatedCode = [...code]; // Create a copy of the code array
        updatedCode[index] = value || null;

        const nextInput = value ? next : prev;
        const input = codeRefs?.current[nextInput];
        input?.focus();

        setCode(updatedCode);

        const isDisabled = updatedCode.filter((item) => item !== null).length !== CODE_LENGTH;
        setDisabled(isDisabled);

        // Set the focus for the current input field
        setTextFocus(index);
    };

    const handleSubmit = async () => {
        // Parse code array into a String
        let parsedCode = "";
        code.forEach((val) => {
            parsedCode += `${val || ""}`.replace(/[^\d]/g, "");
        });
        const codeValidLength = parsedCode.length === CODE_LENGTH;
        if (!codeValidLength) {
            showError("Invalid code", "Code must be 6 digits long");
            return;
        }
        validateVerificationCode(parsedCode);
    };

    const validateVerificationCode = async (code) => {
        try {
            const credential = PhoneAuthProvider.credential(verificationId, code);
            let userData = await linkWithCredential(currentUser, credential);
            userType === "RentACarOwner"
                ? (dispatch(setRentACarUser({ phoneNumberVerified: Boolean(credential) })),
                  AddPhoneNumberToDB(userData.user, "Rent A Car"))
                : userType === "ToursCompany"
                ? (dispatch(setTourUser({ phoneNumberVerified: Boolean(credential) })),
                  AddPhoneNumberToDB(userData.user, "Tours"))
                : userType === "FreightRider" &&
                  (dispatch(setFreightRider({ phoneNumberVerified: Boolean(credential) })),
                  AddPhoneNumberToDB(userData.user, "Freight Riders"));

            await updateUserProfile({
                phoneNumber: phoneNumber,
            });
            setTimeout(() => {
                navigation.navigate("HomeScreen");
            }, 100);
        } catch (error) {
            showError("Validation Error", "Invalid code, Please try again.");
        }
    };

    const sendVerificationCode = () => {
        const formattedNumber = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
        const onSuccess = (status) => setVerificationId(status);
        const onError = (error) => {
            if (error.code == "auth/invalid-verification-code") {
                showError("Invalid code", "Please enter a valid code.");
                return;
            } else if (error.code == "auth/code-expired") {
                showError("Code expired", "Verification code has expired.");
                return;
            } else {
                showError("Something went wrong", "Please try again.");
                // console.log(error);
                return;
            }
        };
        sendPhoneVerificationCode(formattedNumber, recaptchaVerifier.current, onSuccess, onError);
        setVerificationSent(true);
    };

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

    return (
        <KeyboardAvoidingWrapper>
            <SafeAreaView>
                <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={firebaseConfig} />
                <View>
                    <View style={styles.headingContainer}>
                        <Text style={styles.headingText}>Verification Code</Text>
                    </View>
                    <View style={styles.subHeadingContainer}>
                        <Text style={styles.subHeadingText}>
                            A 6-digit code has been sent to {humanPhoneNumber(phoneNumber)}
                        </Text>
                    </View>

                    <View style={styles.codeInputContainer}>
                        {[...Array(6)].map((__, index) => (
                            <TextInput
                                key={index}
                                ref={addToRef}
                                keyboardType="numeric"
                                onFocus={() => setTextFocus(index)}
                                onBlur={() => setTextFocus(null)}
                                onChangeText={(value) => handleInputCode(value, index)}
                                style={[styles.codeInputField, textFocus === index && { borderColor: "#A7E92F" }]}
                            />
                        ))}
                    </View>

                    <Pressable onPress={() => navigation.goBack()} style={styles.linkTextContainer}>
                        <Text style={styles.linkText}>Resend OTP</Text>
                    </Pressable>

                    <PrimaryButton text="Verify" action={() => handleSubmit()} disabled={isDisabled} />
                </View>
            </SafeAreaView>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    headingContainer: {
        paddingHorizontal: 30,
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
    subHeadingContainer: {
        paddingHorizontal: 60,
    },
    subHeadingText: {
        fontSize: 18,
        fontFamily: "SatoshiMedium",
        textAlign: "center",
        color: "#6B7280",
    },
    codeInputContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 25,
    },
    codeInputField: {
        fontSize: 18,
        color: "#000",
        textAlign: "center",
        margin: 6,
        padding: 10,
        width: 40,
        borderWidth: 2,
        borderColor: "#D1D5DB",
    },
    linkTextContainer: {
        textAlign: "right",
        marginLeft: "auto",
        marginHorizontal: 25,
    },
    linkText: {
        fontFamily: "SatoshiMedium",
        fontSize: 14,
        fontWeight: "500",
        color: "#1b2607",
    },
    errorMessage: {
        paddingVertical: 5,
        paddingHorizontal: 30,
        fontSize: 15,
        fontFamily: "SatoshiMedium",
    },
});

export default OTPVerificationScreen;
