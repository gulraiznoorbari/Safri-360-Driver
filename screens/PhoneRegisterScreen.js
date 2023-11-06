import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, BackHandler, Alert, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "react-native-elements";
import { Dropdown } from "react-native-element-dropdown";
const countryCodes = require("country-codes-list");
import { useDispatch } from "react-redux";

import { setUser } from "../store/slices/userSlice";
import InputField from "../components/InputField";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import ErrorMessage from "../components/ErrorMessage";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";

const PhoneRegisterScreen = ({ navigation }) => {
    const dispatch = useDispatch();

    const [isFocus, setIsFocus] = useState(false);
    const [value, setValue] = useState(null);
    const [codes, setCodes] = useState([]);
    const [countryCode, setCountryCode] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const inputRef = useRef();
    const prevValue = useRef();

    useEffect(() => {
        setCodes(countryCodes.all().sort((a, b) => a.countryNameEn.localeCompare(b.countryNameEn)));
        const backAction = () => {
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
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        setErrorMessage("");
        const initialValue = codes.filter((code) => code.countryCode === "PK") || [];
        setCountryCode(initialValue[0]);
    }, [codes]);

    const validateNumber = () => {
        const phoneNumber = (value || "").replace(/[^\d/]/g, "");
        if (phoneNumber.length < 10) return "Invalid phone number";
    };

    const handleSubmit = () => {
        const error = validateNumber();
        if (error) {
            return setErrorMessage(error);
        }
        const fullNumber = "+" + (countryCode?.countryCallingCode || 1) + (value || "").replace(/[^\d/]/g, "");
        dispatch(setUser({ phoneNumber: fullNumber }));
        setTimeout(() => {
            navigation.navigate("OTPVerificationScreen");
        }, 500);
    };

    const handleChangeText = (input) => {
        let text;
        // handle back spacing
        if ((prevValue?.current || "").length > input.length) {
            setValue(input);
            prevValue.current = input;
            return;
        }
        // strips the input and remove all non-digits
        const rawInput = input;
        input = input.replace(/[^\d]/g, "");
        switch (input.length) {
            case 3:
                text = `${input.slice(0, 3)}`;
                break;
            case 6:
                text = `${input.slice(0, 3)} ${input.slice(3, 6)}`;
                break;
            case 10:
                text = `${input.slice(0, 3)} ${input.slice(3, 6)} ${input.slice(6, 10)}`;
                break;
            default:
                text = rawInput || input;
                break;
        }
        prevValue.current = text;
        setValue(text);
        setErrorMessage("");
    };

    const dropDownItem = (item, index) =>
        item?.countryNameEn.length < 25 ? (
            <View key={index} style={styles.dropDownItemRow}>
                <View style={styles.dropdownItemsText}>
                    <Text style={{ fontSize: 16 }}>{item?.flag}</Text>
                    <Text style={styles.dropDownCountryName}>{item?.countryNameEn}</Text>
                </View>
                <Text style={styles.dropDownCallingCode}>+{item?.countryCallingCode}</Text>
            </View>
        ) : null;

    return (
        <KeyboardAvoidingWrapper>
            <SafeAreaView>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Enter your phone number</Text>
                </View>
                <View>
                    <Text style={styles.subHeadingText}>We'll text a code to verify your phone</Text>
                </View>
                <View style={styles.phoneContainer}>
                    <Dropdown
                        virtual
                        showsVerticalScrollIndicator={false}
                        style={[styles.dropdown, isFocus ? styles.focusedDropdown : null]}
                        containerStyle={styles.dropdownItemsContainer}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        data={codes}
                        maxHeight={500}
                        labelField="flag"
                        valueField="flag"
                        placeholder=""
                        value={countryCode?.flag}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={(item) => {
                            setCountryCode(item);
                            setIsFocus(false);
                        }}
                        renderRightIcon={() => (
                            <Icon
                                type="antdesign"
                                name="caretdown"
                                size={13}
                                style={[styles.icon, isFocus ? styles.iconFocused : null]}
                            />
                        )}
                        renderItem={(item, index) => dropDownItem(item, index)}
                    />
                    <View style={styles.numberInputContainer}>
                        <Text style={styles.countryCallingCode}>+{countryCode?.countryCallingCode}</Text>
                        <InputField
                            ref={inputRef}
                            label={""}
                            placeholder={"xxx xxx xxxx"}
                            value={value}
                            maxLength={12}
                            KeyboardType={"numeric"}
                            textContentType={"telephoneNumber"}
                            onChangeCallback={(input) => handleChangeText(input)}
                            inputContainerStyles={styles.phoneNumberInputContainer}
                            inputTextStyles={styles.phoneNumberInputText}
                        />
                    </View>
                </View>
                {errorMessage && <ErrorMessage errorMessage={errorMessage} />}

                <PrimaryButton text={"Next"} action={() => handleSubmit()} disabled={!(value?.length > 10)} />
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
        textAlign: "left",
        fontWeight: "600",
    },
    subHeadingText: {
        fontSize: 18,
        fontFamily: "SatoshiMedium",
        textAlign: "left",
        fontWeight: "600",
        paddingHorizontal: 30,
        paddingBottom: 10,
    },
    phoneContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        height: 50,
        marginVertical: 20,
    },
    dropdown: {
        left: 20,
        paddingRight: 20,
        width: 100,
    },
    focusedDropdown: {
        borderRadius: 2,
        borderWidth: 1,
        borderColor: "#000",
        shadowColor: "#000",
        shadowOffset: {
            width: 4,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    dropdownItemsContainer: {
        position: "relative",
        height: 300,
        overflow: "scroll",
        left: 30,
        width: 300,
        zIndex: 1000,
    },
    dropDownItemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
    },
    dropdownItemsText: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dropDownCountryName: {
        textAlign: "left",
        marginLeft: 12,
        fontSize: 14,
        fontFamily: "SatoshiMedium",
        fontWeight: "500",
    },
    dropDownCallingCode: {
        textAlign: "right",
        marginRight: 5,
        fontSize: 14,
        fontFamily: "SatoshiMedium",
        fontWeight: "500",
    },
    placeholderStyle: {
        fontSize: 12,
        fontFamily: "SatoshiMedium",
        fontWeight: "500",
        textAlign: "center",
    },
    selectedTextStyle: {
        fontSize: 24,
        textAlign: "center",
    },
    icon: {},
    iconFocused: {
        transform: [{ rotate: "180deg" }],
    },
    numberInputContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    countryCallingCode: {
        paddingHorizontal: 7,
        left: 25,
        fontSize: 16,
        fontWeight: "500",
        fontFamily: "SatoshiMedium",
    },
    phoneNumberInputContainer: {
        top: 12,
        marginLeft: 10,
        width: 150,
        fontSize: 16,
        fontWeight: "500",
        fontFamily: "SatoshiMedium",
        backgroundColor: "#E5E7EB",
    },
    phoneNumberInputText: {
        marginLeft: 10,
        fontSize: 17,
        fontWeight: "500",
        textAlign: "left",
        fontFamily: "SatoshiMedium",
    },
});

export default PhoneRegisterScreen;
