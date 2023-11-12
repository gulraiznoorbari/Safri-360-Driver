import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { View, Text, StyleSheet, ToastAndroid, PermissionsAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import { Icon } from "react-native-elements";
import { ref, set } from "firebase/database";
import { useSelector } from "react-redux";
const countryCodes = require("country-codes-list");
import SmsAndroid from "react-native-get-sms-android";

import KeyboardAvoidingWrapper from "../../../../components/KeyboardAvoidingWrapper";
import { dbRealtime } from "../../../../firebase/config";
import { selectUser } from "../../../../store/slices/userSlice";
import InputField from "../../../../components/InputField";
import ErrorMessage from "../../../../components/ErrorMessage";
import PrimaryButton from "../../../../components/Buttons/PrimaryButton";

const AddDriver = ({ navigation }) => {
    const user = useSelector(selectUser);

    const [phoneNumber, setPhoneNumber] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [codes, setCodes] = useState([]);
    const [countryCode, setCountryCode] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const inputRef = useRef();
    const prevValue = useRef();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Add Driver",
            headerTitleStyle: {
                fontSize: 20,
                fontFamily: "SatoshiBlack",
                fontWeight: "400",
            },
            headerTitleAlign: "center",
            headerStyle: {
                height: 60,
            },
        });
    }, [navigation]);

    useEffect(() => {
        setCodes(countryCodes.all().sort((a, b) => a.countryNameEn.localeCompare(b.countryNameEn)));
    }, []);

    useEffect(() => {
        setErrorMessage("");
        const initialValue = codes.filter((code) => code.countryCode === "PK") || [];
        setCountryCode(initialValue[0]);
    }, [codes]);

    const requestSMSPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.SEND_SMS);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can send SMS");
                return true;
            } else {
                console.log("You cannot send SMS");
                return false;
            }
        } catch (error) {
            console.error("Error sending SMS: ", error);
            return false;
        }
    };

    const validateNumber = () => {
        const phoneNum = (phoneNumber || "").replace(/[^\d/]/g, "");
        if (phoneNum.length < 10) return "Invalid phone number";
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
        setErrorMessage("");
    };

    const generateRandomPIN = () => {
        let pin = "";
        const length = 4;
        for (let i = 0; i < length; i++) {
            pin += Math.floor(Math.random() * 10);
        }
        return pin;
    };

    const AddDriverToDB = () => {
        const pin = generateRandomPIN();
        const driverRef = ref(dbRealtime, "Drivers/" + pin);
        const rentACarRef = ref(dbRealtime, "RentACars/" + user.uid + "/Drivers");
        const fullNumber = "+" + countryCode?.countryCallingCode + (phoneNumber || "").replace(/[^\d/]/g, "");
        set(driverRef, {
            phoneNumber: fullNumber,
            RentACarUID: user.uid,
            status: "offline",
        })
            .then(async () => {
                set(rentACarRef, { pinCode: pin });
                const hasSMSPermission = await requestSMSPermission();
                if (hasSMSPermission) {
                    // Send the pin code to the driver via SMS:
                    SmsAndroid.autoSend(
                        fullNumber,
                        `Your PIN is ${pin}. Please use this PIN to login to the app.`,
                        (fail) => {
                            console.log("Failed with this error: " + fail);
                        },
                        (success) => {
                            ToastAndroid.show(
                                "The driver has been sent a login PIN to the provided phone number.",
                                ToastAndroid.SHORT,
                            );
                            console.log("SMS status: ", success);
                        },
                    );
                }
            })
            .catch((error) => {
                console.log("Error adding driver to DB: ", error);
            });
    };

    const handleSubmit = () => {
        const error = validateNumber();
        if (error) {
            return setErrorMessage(error);
        }
        AddDriverToDB();
        setPhoneNumber("");
        setTimeout(() => {
            navigation.goBack();
        }, 200);
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
                    <Text style={styles.headingText}>
                        Enter the Driver's Phone Number so we can send him a unique login PIN.
                    </Text>
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
                {errorMessage && <ErrorMessage errorMessage={errorMessage} />}

                <PrimaryButton
                    text="Send Login PIN"
                    action={() => handleSubmit()}
                    disabled={!(phoneNumber?.length > 10)}
                />
            </SafeAreaView>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    headingContainer: {
        marginVertical: 20,
        marginHorizontal: 20,
    },
    headingText: {
        fontSize: 18,
        fontWeight: "500",
        textAlign: "left",
        fontFamily: "SatoshiBold",
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

export default AddDriver;
