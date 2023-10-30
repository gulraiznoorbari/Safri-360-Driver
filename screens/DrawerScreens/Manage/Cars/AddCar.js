import { useState, useLayoutEffect } from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { ref, set } from "firebase/database";

import { dbRealtime } from "../../../../firebase/config";
import { selectUser } from "../../../../store/slices/userSlice";
import KeyboardAvoidingWrapper from "../../../../components/KeyboardAvoidingWrapper";
import ClearableInput from "../../../../components/ClearableInput";
import PrimaryButton from "../../../../components/Buttons/PrimaryButton";

const AddCar = ({ navigation }) => {
    const user = useSelector(selectUser);

    const [carManufacturer, setCarManufacturer] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carYear, setCarYear] = useState("");
    const [carRegistrationNumber, setCarRegistrationNumber] = useState("");
    const [carColor, setCarColor] = useState("");

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
            status: "Idle",
        })
            .then(() => {
                console.log("Car added to DB");
                ToastAndroid.show("Car Added Successfully", ToastAndroid.SHORT);
                handleClear();
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
    };

    const handleSubmit = () => {
        AddCarToDB();
    };

    return (
        <KeyboardAvoidingWrapper>
            <SafeAreaView style={styles.content}>
                <ClearableInput
                    label={"Car Manufacturer"}
                    placeholder={"Enter Car Manufacturer"}
                    value={carManufacturer}
                    setValue={setCarManufacturer}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"givenName"}
                />
                <ClearableInput
                    label={"Car Model"}
                    placeholder={"Enter Car Model"}
                    value={carModel}
                    setValue={setCarModel}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"givenName"}
                />
                <ClearableInput
                    label={"Car Year"}
                    placeholder={"Enter Car Year"}
                    value={carYear}
                    setValue={setCarYear}
                    hideInput={false}
                    autoComplete={"name"}
                    KeyboardType={"numeric"}
                    textContentType={"givenName"}
                />
                <ClearableInput
                    label={"Car Color"}
                    placeholder={"Enter Car Color"}
                    value={carColor}
                    setValue={setCarColor}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"givenName"}
                />
                <ClearableInput
                    label={"Car Registraion Number"}
                    placeholder={"Enter Car Registraion Number"}
                    value={carRegistrationNumber}
                    setValue={setCarRegistrationNumber}
                    hideInput={false}
                    autoComplete={"name"}
                    textContentType={"givenName"}
                />

                <PrimaryButton
                    text="Add Car"
                    action={() => handleSubmit()}
                    disabled={!carManufacturer && !carModel && !carYear && !carRegistrationNumber && !carColor}
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
