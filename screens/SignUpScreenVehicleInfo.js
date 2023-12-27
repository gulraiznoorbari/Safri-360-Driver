import { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import { useDispatch } from "react-redux";

import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import { setFreightRider } from "../store/slices/freightRiderSlice";
import ClearableInput from "../components/ClearableInput";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import { showError } from "../utils/ErrorHandlers";

const SignUpScreenVehicleInfo = ({ navigation }) => {
    const dispatch = useDispatch();

    const [vehicleType, setVehicleType] = useState("");
    const [carAverage, setCarAverage] = useState("");
    const [carRegistrationNumber, setCarRegistrationNumber] = useState("");

    const vehicles = [
        { label: "Loader Rickshaw", value: "loaderRickshaw" },
        { label: "Pickup Van", value: "pickupVan" },
        { label: "Truck", value: "truck" },
    ];

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            resetInputFields();
        });
        return unsubscribe;
    }, [navigation]);

    const resetInputFields = () => {
        setVehicleType("");
        setCarAverage("");
        setCarRegistrationNumber("");
    };

    const handleChangeText = (input) => {
        const REGISTRATION_NUMBER_REGEX = /^[A-Z]{2,3}-[0-9]{1,4}$/;
        const formattedInput = input
            .toUpperCase()
            .replace(/[^A-Z0-9-]/g, "")
            .replace(/-+/g, "-")
            .replace(/^([A-Z]{2,3})(\d{1,4})$/, "$1-$2");

        if (!formattedInput.match(REGISTRATION_NUMBER_REGEX)) {
            console.log("Invalid Registration Number");
        }
        setCarRegistrationNumber(formattedInput);
    };

    const handleSubmit = () => {
        if (!vehicleType) {
            showError("Input Missing", "Please select a Vehicle Type.");
            return;
        }
        if (!carAverage) {
            showError("Input Missing", "Please enter Car Average.");
            return;
        }
        if (!carRegistrationNumber) {
            showError("Input Missing", "Please enter Car Registration Number");
            return;
        }
        dispatch(
            setFreightRider({
                vehicleInfo: {
                    vehicleType: vehicleType,
                    carAverage: carAverage,
                    carRegistrationNumber: carRegistrationNumber,
                },
            }),
        );
        navigation.navigate("SignUpScreenCredentials");
    };

    return (
        <KeyboardAvoidingWrapper>
            <SafeAreaView>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Sign Up</Text>
                </View>

                <Text style={styles.labelText}>Vehicle Type</Text>
                <Dropdown
                    mode="modal"
                    style={styles.dropdown}
                    data={vehicles}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Vehicle Type"
                    value={vehicleType}
                    onChange={(item) => setVehicleType(item.value)}
                    itemTextStyle={styles.itemTextStyle}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                />
                <ClearableInput
                    label={"Vehicle Average (km/l)"}
                    placeholder={"5, 10, etc"}
                    maxLength={2}
                    value={carAverage}
                    setValue={setCarAverage}
                    hideInput={false}
                    autoComplete={"name"}
                    KeyboardType={"numeric"}
                />
                <ClearableInput
                    label={"Vehicle Registraion Number"}
                    placeholder={"ABC-1234"}
                    maxLength={8}
                    value={carRegistrationNumber}
                    setValue={setCarRegistrationNumber}
                    onChangeCallback={(input) => handleChangeText(input)}
                    hideInput={false}
                    autoComplete={"name"}
                />
                <PrimaryButton
                    text={"Continue"}
                    action={() => handleSubmit()}
                    disabled={!(vehicleType && carAverage && carRegistrationNumber)}
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
    labelText: {
        fontSize: 15,
        fontWeight: "600",
        fontFamily: "SatoshiMedium",
        paddingHorizontal: 20,
    },
    dropdown: {
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 5,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: "#E9E9E9",
    },
    itemTextStyle: {
        fontSize: 15,
        fontWeight: "600",
        fontFamily: "SatoshiMedium",
    },
    selectedTextStyle: {
        marginLeft: 15,
        fontSize: 15,
        fontWeight: "600",
        fontFamily: "SatoshiMedium",
    },
    placeholderStyle: {
        color: "#9c9c9c",
        marginLeft: 10,
        fontSize: 15,
        fontWeight: "600",
        fontFamily: "SatoshiMedium",
    },
});

export default SignUpScreenVehicleInfo;
