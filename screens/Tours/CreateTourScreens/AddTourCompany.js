import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
const countryCodes = require("country-codes-list");
import { ref, update } from "firebase/database";
import { useSelector } from "react-redux";

import { dbRealtime } from "../../../firebase/config";
import { selectTourUser } from "@store/slices/tourSlice";
import ClearableInput from "@components/ClearableInput";
import InputField from "@components/InputField";
import PrimaryButton from "@components/Buttons/PrimaryButton";
import TourAddSuccessModal from "./TourAddSuccessModal";
import KeyboardAvoidingWrapper from "@components/KeyboardAvoidingWrapper";
import { showError } from "@utils/ErrorHandlers";

const AddTourCompany = ({ navigation, route }) => {
    const { tourRefKey } = route.params;
    const user = useSelector(selectTourUser);

    const [companyName, setCompanyName] = useState("");
    const [companyPhoneNumber, setCompanyPhoneNumber] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [codes, setCodes] = useState([]);
    const [countryCode, setCountryCode] = useState(null);
    const [tourAdded, setTourAdded] = useState(false);

    const inputRef = useRef();
    const prevValue = useRef();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Add Tour Company",
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
        const initialValue = codes.filter((code) => code.countryCode === "PK") || [];
        setCountryCode(initialValue[0]);
    }, [codes]);

    const validateNumber = () => {
        const phoneNum = (companyPhoneNumber || "").replace(/[^\d/]/g, "");
        if (phoneNum.length < 10) return "Invalid phone number";
    };

    const handleClear = () => {
        setCompanyName("");
        setCompanyPhoneNumber("");
    };

    const handleSubmit = () => {
        const error = validateNumber();
        if (error) {
            showError("Invalid Phone Number", "Please enter a valid phone number.");
            return;
        }
        const fullNumber = "+" + countryCode?.countryCallingCode + (companyPhoneNumber || "").replace(/[^\d/]/g, "");
        const tourRef = ref(dbRealtime, "Tours/" + user.uid + "/Tours/" + tourRefKey);
        update(tourRef, {
            companyName: companyName,
            companyPhoneNumber: fullNumber,
            createdAt: new Date().toISOString(),
        })
            .then(() => {
                setTourAdded(true);
                console.log("Tour added to DB");
                handleClear();
            })
            .catch((error) => {
                console.log("Error adding tour to DB: ", error);
            });
    };

    const handleChangeText = (input) => {
        let text;
        // handle back spacing
        if ((prevValue?.current || "").length > input.length) {
            setCompanyPhoneNumber(input);
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
        setCompanyPhoneNumber(text);
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
            <SafeAreaView style={styles.container}>
                <ClearableInput
                    label="Company Name:"
                    placeholder="Company Name"
                    value={companyName}
                    setValue={setCompanyName}
                    KeyboardType={"default"}
                    textContentType={"name"}
                />
                <Text style={styles.phoneNumberText}>Phone Number:</Text>
                <View style={styles.phoneNumberContainer}>
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
                            value={companyPhoneNumber}
                            maxLength={15}
                            KeyboardType="numeric"
                            textContentType="telephoneNumber"
                            onChangeCallback={(input) => handleChangeText(input)}
                            inputContainerStyles={styles.phoneNumberInputContainer}
                            inputTextStyles={styles.phoneNumberInputText}
                        />
                    </View>
                </View>

                <TourAddSuccessModal isTourAdded={tourAdded} />
                <PrimaryButton
                    text="Continue"
                    action={() => handleSubmit()}
                    disabled={!(companyName && companyPhoneNumber)}
                />
            </SafeAreaView>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    content: {
        flex: 1,
        width: "100%",
        marginVertical: 20,
        backgroundColor: "#f5f5f5",
    },
    phoneNumberText: {
        left: 20,
        color: "#2e2e2d",
        marginBottom: 5,
        fontSize: 15,
        fontWeight: "400",
        fontFamily: "SatoshiMedium",
    },
    phoneNumberContainer: {
        paddingBottom: 15,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    dropdown: {
        top: 20,
        left: 25,
        paddingRight: 20,
        width: 100,
    },
    focusedDropdown: {
        borderRadius: 2,
        borderWidth: 1,
        borderColor: "#000",
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
        left: 20,
        paddingHorizontal: 7,
        fontSize: 16,
        fontWeight: "500",
        fontFamily: "SatoshiMedium",
    },
    phoneNumberInputContainer: {
        top: 12,
        height: 50,
        width: 160,
        fontSize: 17,
        marginLeft: 10,
        fontWeight: "500",
        fontFamily: "SatoshiMedium",
        backgroundColor: "#E5E7EB",
    },
    phoneNumberInputText: {
        marginLeft: 5,
        padding: 5,
        fontSize: 18,
        textAlign: "left",
        fontWeight: "500",
        fontFamily: "SatoshiMedium",
    },
});

export default AddTourCompany;
