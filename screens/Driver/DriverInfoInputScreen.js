import { useState, useEffect } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ref, update } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";

import { dbRealtime } from "../../firebase/config";
import KeyboardAvoidingWrapper from "@components/KeyboardAvoidingWrapper";
import { setDriver, selectDriver } from "@store/slices/driverSlice";
import ClearableInput from "@components/ClearableInput";
import PrimaryButton from "@components/Buttons/PrimaryButton";
import { showError } from "@utils/ErrorHandlers";

const DriverInfoInputScreen = ({ navigation }) => {
    const driver = useSelector(selectDriver);
    const dispatch = useDispatch();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [cnic, setCNIC] = useState("");
    const driverPIN = driver.pinCode;

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    const handleChangeText = (input) => {
        const CNIC_REGEX = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
        const formattedInput = input.replace(/[^\d/]/g, "").replace(/^(\d{5})(\d{7})(\d{1})$/, "$1-$2-$3");
        if (!formattedInput.match(CNIC_REGEX)) {
            console.log("Invalid CNIC");
        }
        if (formattedInput.length <= 15) {
            setCNIC(formattedInput);
        }
    };

    const validateCNIC = () => {
        const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
        if (!CNIC_REGEX.test(cnic)) {
            showError("Invalid CNIC", "Please enter a valid CNIC.");
            return false;
        }
    };

    const handleClear = () => {
        setFirstName("");
        setLastName("");
        setCNIC("");
    };

    const handleSubmit = () => {
        if (!validateCNIC()) {
            return;
        }
        const driverRef = ref(dbRealtime, "Drivers/" + driverPIN);
        update(driverRef, {
            CNIC: cnic,
            firstName: firstName,
            lastName: lastName,
        })
            .then(() => {
                dispatch(setDriver({ CNIC: cnic, firstName: firstName, lastName: lastName }));
                navigation.navigate("DriverHomeScreen");
                handleClear();
            })
            .catch((error) => {
                showError("Something went wrong!", "Please try again later.");
                // console.log(error);
                return;
            });
    };

    const restrictGoingBack = () => {
        Alert.alert("Hold on!", "Are you sure you want to exit the app?", [
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
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Driver Details</Text>
                </View>

                <ClearableInput
                    label={"First Name"}
                    placeholder={"Enter First Name"}
                    value={firstName}
                    setValue={setFirstName}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"givenName"}
                />

                <ClearableInput
                    label={"Last Name"}
                    placeholder={"Enter Last Name"}
                    value={lastName}
                    setValue={setLastName}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"familyName"}
                />

                <ClearableInput
                    label={"CNIC"}
                    placeholder={"xxxxx-xxxxxxx-x"}
                    value={cnic}
                    setValue={setCNIC}
                    onChangeCallback={(input) => handleChangeText(input)}
                    maxLength={15}
                    hideInput={false}
                    autoComplete={"off"}
                    KeyboardType={"numeric"}
                    textContentType={"none"}
                />

                <PrimaryButton
                    text={"Next"}
                    action={() => handleSubmit()}
                    disabled={!(firstName && lastName && cnic)}
                />
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
        textAlign: "center",
        fontSize: 28,
        fontWeight: "600",
        fontFamily: "SatoshiBlack",
    },
});

export default DriverInfoInputScreen;
