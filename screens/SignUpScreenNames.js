import { DEFAULT_PROFILE_IMAGE } from "@env";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

import { setUser, resetUser } from "../store/slices/userSlice";
import { useFirebase } from "../contexts/FirebaseContext";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import ErrorMessage from "../components/ErrorMessage";
import ClearableInput from "../components/ClearableInput";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";

const SignUpScreenNames = ({ navigation }) => {
    const dispatch = useDispatch();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [companyName, setCompanyName] = useState("");

    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [companyNameError, setCompanyNameError] = useState("");

    const { updateUserProfile } = useFirebase();

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            dispatch(resetUser());
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            resetInputFields();
        });
        return unsubscribe;
    }, [navigation]);

    const resetInputFields = () => {
        setFirstName("");
        setLastName("");
        setCompanyName("");
    };

    const handleSubmit = () => {
        // Clear previous errors
        setFirstNameError("");
        setLastNameError("");
        setCompanyNameError("");

        let isValid = true;

        if (!firstName.trim()) {
            setFirstNameError("First Name is required");
            isValid = false;
        }

        if (!lastName.trim()) {
            setLastNameError("Last Name is required");
            isValid = false;
        }

        if (!companyName.trim()) {
            setCompanyNameError("Company Name is required");
            isValid = false;
        }

        if (isValid) {
            dispatch(
                setUser({
                    firstName: firstName,
                    lastName: lastName,
                    companyName: companyName,
                    userName: firstName,
                }),
            );
            updateUserProfile({
                firstName: firstName,
                lastName: lastName,
                displayName: firstName,
                photoURL: DEFAULT_PROFILE_IMAGE,
            });
            navigation.navigate("SignUpScreenCredentials");
        }
    };

    return (
        <KeyboardAvoidingWrapper>
            <SafeAreaView>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Sign Up</Text>
                </View>

                <ClearableInput
                    label={"First Name"}
                    placeholder={"Enter First Name"}
                    value={firstName}
                    setValue={setFirstName}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"name"}
                />
                {firstNameError && <ErrorMessage errorMessage={firstNameError} />}

                <ClearableInput
                    label={"Last Name"}
                    placeholder={"Enter Last Name"}
                    value={lastName}
                    setValue={setLastName}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"name"}
                />
                {lastNameError && <ErrorMessage errorMessage={lastNameError} />}

                <ClearableInput
                    label={"Company Name"}
                    placeholder={"Enter Company Name"}
                    value={companyName}
                    setValue={setCompanyName}
                    hideInput={false}
                    autoComplete={"organization"}
                    textContentType={"organizationName"}
                />
                {companyNameError && <ErrorMessage errorMessage={companyNameError} />}

                <PrimaryButton
                    text={"Continue"}
                    action={() => handleSubmit()}
                    disabled={!(firstName && lastName && companyName)}
                />
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
    LoginOptionContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    LoginOptionText: {
        fontFamily: "Satoshi",
        fontSize: 14,
        color: "#2e2e2d",
    },
    linkText: {
        fontFamily: "SatoshiMedium",
        fontSize: 14,
        fontWeight: "500",
        color: "#1b2607",
    },
});

export default SignUpScreenNames;
