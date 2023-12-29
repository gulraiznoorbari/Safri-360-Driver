import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "react-native-elements";
import { Dropdown } from "react-native-element-dropdown";
const countryCodes = require("country-codes-list");
import { get, ref } from "firebase/database";
import { useDispatch } from "react-redux";

import { dbRealtime } from "../../firebase/config";
import KeyboardAvoidingWrapper from "@components/KeyboardAvoidingWrapper";
import { setUserType } from "@store/slices/userTypeSlice";
import { setDriver } from "@store/slices/driverSlice";
import ClearableInput from "@components/ClearableInput";
import InputField from "@components/InputField";
import PrimaryButton from "@components/Buttons/PrimaryButton";
import { showError } from "@utils/ErrorHandlers";

const DriverLoginScreen = ({ navigation }) => {
    const dispatch = useDispatch();

    const [phoneNumber, setPhoneNumber] = useState(null);
    const [pinCode, setPinCode] = useState("");
    const [isFocus, setIsFocus] = useState(false);
    const [codes, setCodes] = useState([]);
    const [countryCode, setCountryCode] = useState(null);

    const inputRef = useRef();
    const prevValue = useRef();

    useEffect(() => {
        setCodes(countryCodes.all().sort((a, b) => a.countryNameEn.localeCompare(b.countryNameEn)));
        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    useEffect(() => {
        const initialValue = codes.filter((code) => code.countryCode === "PK") || [];
        setCountryCode(initialValue[0]);
    }, [codes]);

    const validateNumber = () => {
        const phoneNum = (phoneNumber || "").replace(/[^\d/]/g, "");
        if (phoneNum.length < 10) {
            showError("Invalid phone number!", "Please try again.");
            return false;
        }
    };

    const handleClear = () => {
        setPhoneNumber("");
        setPinCode("");
    };

    const restrictGoingBack = () => {
        dispatch(setUserType(null));
        return true;
    };

    const handleSubmit = () => {
        if (!validateNumber()) {
            return;
        }
        const fullNumber = "+" + countryCode?.countryCallingCode + (phoneNumber || "").replace(/[^\d/]/g, "");
        const NoDriverFound =
            "\nPlease contact the affiliated Rent A Car owner to register as a driver and receive your login PIN.";
        const pinCodeRef = ref(dbRealtime, "Drivers");
        get(pinCodeRef)
            .then((snapshot) => {
                const data = snapshot.val();
                if (!data) {
                    showError("No driver found!", NoDriverFound);
                    return;
                }
                let driverFound = false;
                let pinCodeFound = false;
                let phoneNumberFound = false;
                for (let key in data) {
                    if (key === pinCode) {
                        pinCodeFound = true;
                        if (data[key].phoneNumber === fullNumber) {
                            dispatch(
                                setDriver({
                                    phoneNumber: fullNumber,
                                    pinCode: pinCode,
                                }),
                            );
                            phoneNumberFound = true;
                            driverFound = true;
                            setTimeout(() => {
                                dispatch(setDriver({ isLoggedIn: true }));
                                navigation.navigate("DriverHomeScreen");
                            }, 100);
                            handleClear();
                            break;
                        }
                    }
                }
                if (!driverFound) showError("No driver found!", NoDriverFound);
                if (driverFound && !pinCodeFound) showError("Invalid PIN Code!", "Please try again.");
                if (driverFound && pinCodeFound && !phoneNumberFound)
                    showError("Invalid phone number!", "Please try again.");
            })
            .catch((error) => {
                showError("Something went wrong!", "Please try again later.");
                return;
            });
    };

    const handleChangeText = (input) => {
        let text;
        // handle back spacing
        if ((prevValue?.current || "").length > input.length) {
            setPhoneNumber(input);
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
        setPhoneNumber(text);
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
                    <Text style={styles.headingText}>Driver Login</Text>
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
                            label=""
                            placeholder="xxx xxx xxxx"
                            value={phoneNumber}
                            maxLength={15}
                            KeyboardType="numeric"
                            textContentType="telephoneNumber"
                            onChangeCallback={(input) => handleChangeText(input)}
                            inputContainerStyles={styles.phoneNumberInputContainer}
                            inputTextStyles={styles.phoneNumberInputText}
                        />
                    </View>
                </View>

                <ClearableInput
                    label="PIN Code"
                    placeholder="XXXX"
                    value={pinCode}
                    setValue={setPinCode}
                    hideInput={false}
                    maxLength={4}
                    KeyboardType={"numeric"}
                />

                <PrimaryButton text="Login" action={() => handleSubmit()} disabled={!(phoneNumber && pinCode)} />
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
        fontSize: 17,
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
        fontSize: 18,
        fontWeight: "500",
        textAlign: "left",
        fontFamily: "SatoshiMedium",
    },
});

export default DriverLoginScreen;
