import { useState, useEffect, useLayoutEffect } from "react";
import { Alert, BackHandler, StyleSheet, View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { ref, push, update } from "firebase/database";

import { dbRealtime } from "../../../firebase/config";
import { selectTourUser } from "@store/slices/tourSlice";
import ClearableInput from "@components/ClearableInput";
import PlacesAutocomplete from "@components/PlacesAutocomplete";
import PrimaryButton from "@components/Buttons/PrimaryButton";
import DateRangePicker from "@components/Tours/DateRangePicker";
import TimePicker from "@components/Tours/TimePicker";
import moment from "moment";

const AddTourMain = ({ navigation }) => {
    const user = useSelector(selectTourUser);

    const [tourName, setTourName] = useState("");
    const [tourPickup, setTourPickup] = useState(null);
    const [tourDestination, setTourDestination] = useState(null);
    const [tourStartDate, setTourStartDate] = useState(null);
    const [tourEndDate, setTourEndDate] = useState(null);
    const [tourDepartureTime, setTourDepartureTime] = useState(null);
    const [tourDays, setTourDays] = useState("");
    const [tourNights, setTourNights] = useState("");

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Add Tour Location",
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
        BackHandler.addEventListener("hardwareBackPress", restrictGoingBack);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", restrictGoingBack);
        };
    }, []);

    useEffect(() => {
        calculateDaysAndNights();
    }, [tourStartDate, tourEndDate]);

    const calculateDaysAndNights = () => {
        if (tourStartDate && tourEndDate) {
            const startDate = new Date(moment(tourStartDate, "DD/MM/YYYY").toDate());
            const endDate = new Date(moment(tourEndDate, "DD/MM/YYYY").toDate());
            const timeDifference = endDate.getTime() - startDate.getTime();
            const daysDifference = timeDifference / (1000 * 3600 * 24);
            setTourDays(daysDifference);
            setTourNights(daysDifference - 1);
        }
    };

    const handleSubmit = () => {
        const toursRef = ref(dbRealtime, "Tours/" + user.uid + "/Tours/");
        const tourRef = push(toursRef);
        update(tourRef, {
            tourID: tourRef.key.toString(),
            tourName: tourName,
            tourPickup: tourPickup,
            tourDestination: tourDestination,
            tourStartDate: tourStartDate,
            tourEndDate: tourEndDate,
            tourDepartureTime: tourDepartureTime,
            tourDays: tourDays,
            tourNights: tourNights,
            tourBookingStatus: "Open",
        })
            .then(() => {
                setTimeout(() => {
                    navigation.navigate("AddTourFareScreen", { tourRefKey: tourRef.key.toString() });
                }, 200);
                console.log("Tour added successfully");
            })
            .catch((error) => {
                console.log("Tour could not be added", error);
            });
    };

    const restrictGoingBack = () => {
        Alert.alert("Hold on!", "Are you sure you want to leave the form?", [
            {
                text: "Cancel",
                onPress: () => null,
                style: "cancel",
            },
            { text: "YES", onPress: () => navigation.navigate("Home") },
        ]);
        return true;
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <SafeAreaView style={styles.content}>
                <View style={{ marginBottom: -10 }}>
                    <ClearableInput
                        label="Tour Name:"
                        placeholder="Naran Kaghan Tour, etc."
                        value={tourName}
                        setValue={setTourName}
                        hideInput={false}
                        autoComplete={"name"}
                        textContentType={"name"}
                    />
                </View>
                <PlacesAutocomplete
                    label={"Pickup Point:"}
                    placeholder={"Pickup Point"}
                    onPlaceSelected={(details, data) => {
                        const pickupPointInfo = {
                            locationName: data.structured_formatting?.main_text,
                            latitude: details.geometry?.location.lat,
                            longitude: details.geometry?.location.lng,
                        };
                        console.log("pickupPointInfo", pickupPointInfo);
                        setTourPickup(pickupPointInfo);
                    }}
                />
                <PlacesAutocomplete
                    label={"Destination:"}
                    placeholder={"Destination"}
                    onPlaceSelected={(details, data) => {
                        const destinationInfo = {
                            locationName: data.structured_formatting?.main_text,
                            latitude: details.geometry?.location.lat,
                            longitude: details.geometry?.location.lng,
                        };
                        console.log("destinationInfo", destinationInfo);
                        setTourDestination(destinationInfo);
                    }}
                />
                <DateRangePicker
                    tourStartDate={tourStartDate}
                    setTourStartDate={setTourStartDate}
                    tourEndDate={tourEndDate}
                    setTourEndDate={setTourEndDate}
                />
                <TimePicker tourDepartureTime={tourDepartureTime} setTourDepartureTime={setTourDepartureTime} />
                <PrimaryButton
                    text="Continue"
                    action={() => handleSubmit()}
                    disabled={
                        !(
                            tourName &&
                            tourPickup &&
                            tourDestination &&
                            tourStartDate &&
                            tourEndDate &&
                            tourDepartureTime
                        )
                    }
                />
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        width: "100%",
        paddingVertical: 20,
        backgroundColor: "#f5f5f5",
    },
});

export default AddTourMain;
