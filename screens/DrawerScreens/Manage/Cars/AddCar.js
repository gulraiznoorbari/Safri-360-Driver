import { useState, useLayoutEffect } from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { ref, set } from "firebase/database";

import { dbRealtime } from "../../../../firebase/config";
import { selectRentACarUser } from "../../../../store/slices/rentACarSlice";
import KeyboardAvoidingWrapper from "../../../../components/KeyboardAvoidingWrapper";
import ClearableInput from "../../../../components/ClearableInput";
import PrimaryButton from "../../../../components/Buttons/PrimaryButton";

const AddCar = ({ navigation }) => {
    const user = useSelector(selectRentACarUser);

    const [carManufacturer, setCarManufacturer] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carYear, setCarYear] = useState("");
    const [carRegistrationNumber, setCarRegistrationNumber] = useState("");
    const [carColor, setCarColor] = useState("");
    const [carAverage, setCarAverage] = useState("");

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Add Car",
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

    const AddCarToDB = () => {
        const carRef = ref(dbRealtime, "Rent A Car/" + user.uid + "/Cars/" + carRegistrationNumber);
        set(carRef, {
            manufacturer: carManufacturer,
            model: carModel,
            year: carYear,
            registrationNumber: carRegistrationNumber,
            color: carColor,
            average: carAverage,
            status: "Idle",
        })
            .then(() => {
                console.log("Car added to DB");
                ToastAndroid.show("Car Added Successfully", ToastAndroid.SHORT);
                handleClear();
                navigation.goBack();
            })
            .catch((error) => {
                console.log("Error adding car to DB: ", error);
            });
    };

    const handleClear = () => {
        setCarManufacturer("");
        setCarModel("");
        setCarYear("");
        setCarRegistrationNumber("");
        setCarColor("");
        setCarAverage("");
    };

    const handleSubmit = () => {
        AddCarToDB();
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

    return (
        <KeyboardAvoidingWrapper>
            <SafeAreaView style={styles.content}>
                <ClearableInput
                    label={"Car Manufacturer"}
                    placeholder={"Honda, Toyota, etc."}
                    value={carManufacturer}
                    setValue={setCarManufacturer}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"givenName"}
                />
                <ClearableInput
                    label={"Car Model"}
                    placeholder={"Civic, Corolla, etc."}
                    value={carModel}
                    setValue={setCarModel}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"givenName"}
                />
                <ClearableInput
                    label={"Car Year"}
                    placeholder={"XXXX"}
                    maxLength={4}
                    value={carYear}
                    setValue={setCarYear}
                    hideInput={false}
                    autoComplete={"name"}
                    KeyboardType={"numeric"}
                />
                <ClearableInput
                    label={"Car Color"}
                    placeholder={"White, Black, etc."}
                    maxLength={15}
                    value={carColor}
                    setValue={setCarColor}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"givenName"}
                />
                <ClearableInput
                    label={"Car Average (km/l)"}
                    placeholder={"5, 10,..."}
                    maxLength={2}
                    value={carAverage}
                    setValue={setCarAverage}
                    hideInput={false}
                    autoComplete={"name"}
                    KeyboardType={"numeric"}
                />
                <ClearableInput
                    label={"Car Registraion Number"}
                    placeholder={"ABC-1234"}
                    maxLength={8}
                    value={carRegistrationNumber}
                    setValue={setCarRegistrationNumber}
                    onChangeCallback={(input) => handleChangeText(input)}
                    hideInput={false}
                    autoComplete={"name"}
                />

                <PrimaryButton
                    text="Add Car"
                    action={() => handleSubmit()}
                    disabled={
                        !(carManufacturer && carModel && carYear && carRegistrationNumber && carColor && carAverage)
                    }
                />
            </SafeAreaView>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingVertical: 20,
    },
});

export default AddCar;
