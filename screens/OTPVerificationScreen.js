import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PhoneAuthProvider, linkWithCredential } from "firebase/auth";
import { ref, set, child } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";

import { FirebaseRecaptchaVerifierModal } from "../components/firebase-recaptcha/modal";
import { useFirebase } from "../contexts/FirebaseContext";
import firebaseConfig, { dbRealtime } from "../firebase/config";
import { selectUser, setUser } from "../store/slices/userSlice";
import { humanPhoneNumber } from "../utils/humanPhoneNumber";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import PrimaryButton from "../components/Buttons/PrimaryButton";

const OTPVerificationScreen = ({ navigation }) => {
    const CODE_LENGTH = 6;
    const { sendPhoneVerificationCode, currentUser, updateUserProfile } = useFirebase();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const phoneNumber = user.phoneNumber;

    const [code, setCode] = useState([...Array(CODE_LENGTH)]);
    const [verificationId, setVerificationId] = useState();
    const [verificationSent, setVerificationSent] = useState(false);
    const [messageColor, setMessageColor] = useState("red");
    const [message, setMessage] = useState(null);
    const [isDisabled, setDisabled] = useState(true);
    const [textFocus, setTextFocus] = useState(false);

    const recaptchaVerifier = useRef(null);
    const codeRefs = useRef([]);
    codeRefs.current = [];

    useEffect(() => {
        console.log("OTPVerificationScreen loaded");
        if (!phoneNumber) return handleMessage("Something went wrong. Phone number was not found", "red");
        if (!verificationSent) {
            sendVerificationCode();
        }
    }, []);

    const addToRef = (element) => {
        if (element && !codeRefs.current.includes(element)) {
            codeRefs.current.push(element);
        }
    };

    const AddPhoneNumberToDB = (user) => {
        const userRef = ref(dbRealtime, "Riders/" + user.uid);
        const phoneNumberRef = child(userRef, "phoneNumber");
        set(phoneNumberRef, phoneNumber)
            .then(() => {
                console.log("Phone number added to DB");
            })
            .catch((error) => {
                console.log("Error adding phone number to DB: ", error);
            });
    };

    const handleMessage = (message, color = "red") => {
        try {
            message = typeof message === "string" ? message : message.join("\n");
            setMessage(message);
        } catch {
            setMessage(`${message}`);
        }
        setMessageColor(color);
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
            handleMessage("Invalid verification code");
            return;
        }
        validateVerificationCode(parsedCode);
    };

    const validateVerificationCode = async (code) => {
        try {
            const credential = PhoneAuthProvider.credential(verificationId, code);
            let userData = await linkWithCredential(currentUser, credential);
            dispatch(setUser({ phoneNumberVerified: Boolean(credential) }));
            AddPhoneNumberToDB(userData.user);
            updateUserProfile({
                phoneNumber: phoneNumber,
            });
            setTimeout(() => {
                navigation.navigate("HomeScreen");
            }, 100);
        } catch (error) {
            handleMessage(`Error: ${error.message}`, "red");
        }
    };

    const sendVerificationCode = () => {
        const formattedNumber = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
        const onSuccess = (status) => setVerificationId(status);
        const onError = (error) => {
            if (error.code == "auth/invalid-verification-code") {
                handleMessage("Invalid verification code", "red");
            } else if (error.code == "auth/code-expired") {
                handleMessage("Verification code has expired", "red");
            } else {
                handleMessage(`Error: ${error.message}`, "red");
            }
        };
        sendPhoneVerificationCode(formattedNumber, recaptchaVerifier.current, onSuccess, onError);
        setVerificationSent(true);
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

                    <Text style={[{ color: messageColor }, message && styles.errorMessage]}>{message}</Text>

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
        marginVertical: 30,
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
    errorMessage: {
        paddingVertical: 5,
        paddingHorizontal: 30,
        fontSize: 15,
        fontFamily: "SatoshiMedium",
    },
});

export default OTPVerificationScreen;
