import { DEFAULT_PROFILE_IMAGE } from "@env";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";

import { setRentACarUser, resetRentACarUser } from "../store/slices/rentACarSlice";
import { setTourUser, resetTourUser } from "../store/slices/tourSlice";
import { setFreightRider, resetFreightRider } from "../store/slices/freightRiderSlice";
import { selectUserType } from "../store/slices/userTypeSlice";
import { useFirebase } from "../contexts/FirebaseContext";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import TransparentButton from "../components/Buttons/TransparentButton";
import ClearableInput from "../components/ClearableInput";

const SignUpScreenNames = ({ navigation }) => {
    const userType = useSelector(selectUserType);
    const dispatch = useDispatch();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [cnic, setCNIC] = useState("");

    const { updateUserProfile } = useFirebase();

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            userType === "RentACarOwner"
                ? dispatch(resetRentACarUser())
                : userType === "ToursCompany"
                ? dispatch(resetTourUser())
                : userType === "FreightRider" && dispatch(resetFreightRider());
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
        userType === "FreightRider" ? setCNIC("") : setCompanyName("");
    };

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

    const handleSubmit = () => {
        userType === "RentACarOwner"
            ? dispatch(
                  setRentACarUser({
                      firstName: firstName,
                      lastName: lastName,
                      companyName: companyName,
                      userName: firstName,
                  }),
              )
            : userType === "ToursCompany"
            ? dispatch(
                  setTourUser({
                      firstName: firstName,
                      lastName: lastName,
                      companyName: companyName,
                      userName: firstName,
                  }),
              )
            : userType === "FreightRider" &&
              dispatch(
                  setFreightRider({
                      firstName: firstName,
                      lastName: lastName,
                      userName: firstName,
                      CNIC: cnic,
                  }),
              );
        updateUserProfile({
            firstName: firstName,
            lastName: lastName,
            displayName: firstName,
            photoURL: DEFAULT_PROFILE_IMAGE,
        });
        userType === "FreightRider"
            ? navigation.navigate("SignUpScreenVehicleInfo")
            : navigation.navigate("SignUpScreenCredentials");
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
                <ClearableInput
                    label={"Last Name"}
                    placeholder={"Enter Last Name"}
                    value={lastName}
                    setValue={setLastName}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"name"}
                />
                {userType === "FreightRider" ? (
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
                ) : (
                    <ClearableInput
                        label={"Company Name"}
                        placeholder={"Enter Company Name"}
                        value={companyName}
                        setValue={setCompanyName}
                        hideInput={false}
                        autoComplete={"organization"}
                        textContentType={"organizationName"}
                    />
                )}
                <PrimaryButton
                    text={"Continue"}
                    action={() => handleSubmit()}
                    disabled={
                        userType === "FreightRider"
                            ? !(firstName && lastName && cnic)
                            : !(firstName && lastName && companyName)
                    }
                />
                {userType === "FreightRider" && (
                    <TransparentButton text="Already have an account" navigation={navigation} navigateTo={"Login"} />
                )}
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
