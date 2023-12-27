import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "react-native-elements";
import { Dropdown } from "react-native-element-dropdown";
const countryCodes = require("country-codes-list");
import { useSelector, useDispatch } from "react-redux";

import { setRentACarUser } from "@store/slices/rentACarSlice";
import { setTourUser } from "@store/slices/tourSlice";
import { setFreightRider } from "@store/slices/freightRiderSlice";
import { selectUserType } from "@store/slices/userTypeSlice";
import KeyboardAvoidingWrapper from "@components/KeyboardAvoidingWrapper";
import InputField from "@components/InputField";
import PrimaryButton from "@components/Buttons/PrimaryButton";
import { showError } from "@utils/ErrorHandlers";

const ChangePhoneNumberScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const userType = useSelector(selectUserType);

    const [isFocus, setIsFocus] = useState(false);
    const [value, setValue] = useState(null);
    const [codes, setCodes] = useState([]);
    const [countryCode, setCountryCode] = useState(null);

    const inputRef = useRef();
    const prevValue = useRef();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Change Phone Number",
            headerTitleStyle: {
                fontSize: 21,
                fontFamily: "SatoshiBlack",
                fontWeight: "400",
            },
            headerTitleAlign: "center",
            headerStyle: {
                height: 70,
            },
        });
    }, [navigation]);

    useEffect(() => {
        setCodes(countryCodes.all().sort((a, b) => a.countryNameEn.localeCompare(b.countryNameEn)));
    }, []);

    useEffect(() => {
        const initialValue = codes.filter((code) => code.countryCode === "PK") || [];
        setCountryCode(initialValue[0]);
    }, [codes]);

    const validateNumber = () => {
        const phoneNumber = (value || "").replace(/[^\d/]/g, "");
        if (phoneNumber.length < 10) {
            showError("Invalid Phone Number", "Please enter a valid phone number.");
            return false;
        }
    };

    const handleSubmit = () => {
        if (!validateNumber()) {
            return;
        }
        const fullNumber = "+" + (countryCode?.countryCallingCode || 1) + (value || "").replace(/[^\d/]/g, "");
        userType === "RentACarOwner"
            ? dispatch(setRentACarUser({ phoneNumber: fullNumber }))
            : userType === "ToursCompany"
            ? dispatch(setTourUser({ phoneNumber: fullNumber }))
            : userType === "FreightRider" && dispatch(setFreightRider({ phoneNumber: fullNumber }));
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
                <View style={styles.subHeadingContainer}>
                    <Text style={styles.subHeadingText}>Enter new phone number</Text>
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
                            placeholder={"202 555 0123"}
                            value={value}
                            maxLength={12}
                            KeyboardType={"numeric"}
                            textContentType={"telephoneNumber"}
                            onChangeCallback={(input) => handleChangeText(input)}
                            onSubmitEditingCallback={() => handleSubmit()}
                            inputContainerStyles={styles.phoneNumberInputContainer}
                            inputTextStyles={styles.phoneNumberInputText}
                        />
                    </View>
                </View>

                <PrimaryButton text={"Next"} action={() => handleSubmit()} disabled={!(value?.length > 9)} />
            </SafeAreaView>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    subHeadingContainer: {
        marginTop: 20,
        marginBottom: 10,
    },
    subHeadingText: {
        fontSize: 18,
        fontFamily: "SatoshiBold",
        textAlign: "center",
        fontWeight: "500",
        paddingHorizontal: 30,
    },
    phoneContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        height: 50,
        marginVertical: 30,
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

export default ChangePhoneNumberScreen;
