import { useState, useLayoutEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { ref, update } from "firebase/database";

import { dbRealtime } from "../../../firebase/config";
import { selectTourUser } from "@store/slices/tourSlice";
import ClearableInput from "@components/ClearableInput";
import { showError } from "@utils/ErrorHandlers";
import PrimaryButton from "@components/Buttons/PrimaryButton";
import KeyboardAvoidingWrapper from "@components/KeyboardAvoidingWrapper";

const AddTourFare = ({ navigation, route }) => {
    const { tourRefKey } = route.params;
    const user = useSelector(selectTourUser);

    const [tourFare, setTourFare] = useState("");
    const [tourSeats, setTourSeats] = useState("");
    const [tourItenary, setTourItenary] = useState("");

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Add Tour Fare",
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

    const validateNumericInput = (input) => {
        const regex = /^[0-9]+$/;
        if (regex.test(input)) {
            return true;
        } else {
            showError("Invalid Input Format!", "Please enter a valid number.");
        }
    };

    const handleAddTour = () => {
        const tourRef = ref(dbRealtime, "Tours/" + user.uid + "/Tours/" + tourRefKey);
        update(tourRef, {
            tourFare: tourFare,
            tourSeats: tourSeats,
            tourItenary: tourItenary,
            tourSeatsLeft: tourSeats,
            tourTotalFare: tourFare * (tourSeats - tourSeats),
        })
            .then(() => {
                setTimeout(() => {
                    navigation.navigate("AddTourCompanyScreen", { tourRefKey: tourRefKey });
                }, 200);
                console.log("Tour added to DB");
            })
            .catch((error) => {
                console.log("Error adding tour to DB: ", error);
            });
    };

    return (
        <KeyboardAvoidingWrapper>
            <SafeAreaView style={styles.content}>
                <ClearableInput
                    label="Number of Seats:"
                    placeholder="10, 15, 20, etc."
                    value={tourSeats}
                    setValue={setTourSeats}
                    onChangeCallback={(input) => (validateNumericInput(input) ? setTourSeats(input) : setTourSeats(""))}
                    KeyboardType={"numeric"}
                    autoComplete={"off"}
                    maxLength={3}
                    textContentType={"none"}
                />
                <ClearableInput
                    label="Tour Fare (per Person):"
                    placeholder="Total Tour Fare"
                    value={tourFare}
                    setValue={setTourFare}
                    onChangeCallback={(input) => (validateNumericInput(input) ? setTourFare(input) : setTourFare(""))}
                    KeyboardType={"numeric"}
                    autoComplete={"off"}
                    maxLength={5}
                    textContentType={"none"}
                />
                <ClearableInput
                    label="Tour Itenaries:"
                    placeholder="Tour Itenaries"
                    value={tourItenary}
                    setValue={setTourItenary}
                    KeyboardType={"default"}
                    autoComplete={"off"}
                    textContentType={"none"}
                    multiline={true}
                    numberOfLines={5}
                />
                <PrimaryButton
                    text="Continue"
                    action={() => handleAddTour()}
                    disabled={!(tourFare, tourSeats, tourItenary)}
                />
            </SafeAreaView>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    content: {
        width: "100%",
        paddingVertical: 20,
    },
});

export default AddTourFare;
