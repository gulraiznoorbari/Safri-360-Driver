import { useState, useLayoutEffect } from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ref, update } from "firebase/database";
import { useSelector } from "react-redux";

import { dbRealtime } from "../../../../firebase/config";
import { selectRentACarUser } from "@store/slices/rentACarSlice";
import KeyboardAvoidingWrapper from "@components/KeyboardAvoidingWrapper";
import ClearableInput from "@components/ClearableInput";
import PrimaryButton from "@components/Buttons/PrimaryButton";

const AddCar = ({ navigation, route }) => {
    const { data } = route.params;
    const user = useSelector(selectRentACarUser);

    const [carManufacturer, setCarManufacturer] = useState(data?.manufacturer);
    const [carModel, setCarModel] = useState(data?.model);
    const [carYear, setCarYear] = useState(data?.year);
    const [carRegistrationNumber, setCarRegistrationNumber] = useState(data?.registrationNumber);
    const [carColor, setCarColor] = useState(data?.color);
    const [carAverage, setCarAverage] = useState(data?.average);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Edit Car",
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

    const updateCar = (registrationNumber) => {
        const carRef = ref(dbRealtime, "Rent A Car/" + user.uid + "/Cars/" + registrationNumber);
        update(carRef, {
            manufacturer: carManufacturer,
            model: carModel,
            year: carYear,
            registrationNumber: carRegistrationNumber,
            color: carColor,
            average: carAverage,
        })
            .then(() => {
                console.log("Car updated in DB");
                ToastAndroid.show("Car Updated Successfully", ToastAndroid.SHORT);
                navigation.navigate("DisplayCarsScreen");
            })
            .catch((error) => {
                console.log("Error updating car in DB: ", error);
            });
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
                    label={"Car Average"}
                    placeholder={"Enter Car Average"}
                    value={carAverage}
                    setValue={setCarAverage}
                    hideInput={false}
                    autoComplete={"name"}
                    KeyboardType={"numeric"}
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
                    text="Update Car"
                    action={() => updateCar(data?.registrationNumber)}
                    disabled={
                        !carManufacturer || !carModel || !carYear || !carRegistrationNumber || !carColor || !carAverage
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
