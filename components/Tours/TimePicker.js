import { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

const TimePicker = ({ tourDepartureTime, setTourDepartureTime }) => {
    const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

    const showTimePicker = () => {
        setIsTimePickerVisible(true);
    };

    const hideTimePicker = () => {
        setIsTimePickerVisible(false);
    };

    const handleConfirm = (time) => {
        const formattedTime = moment(time).format("hh:mm A");
        console.log("Time: ", formattedTime);
        setTourDepartureTime(formattedTime);
        hideTimePicker();
    };

    const renderTimeInfo = () => {
        if (tourDepartureTime) {
            const formattedTime = moment(tourDepartureTime, "hh:mm A").format("hh:mm A");
            return `${formattedTime}`;
        } else {
            return "";
        }
    };

    return (
        <View style={styles.timeContainer}>
            <Text style={styles.labelText}>Tour Departure Time:</Text>
            <TouchableOpacity onPress={showTimePicker}>
                <TextInput
                    value={renderTimeInfo()}
                    editable={false}
                    placeholder="Select Departure Time"
                    style={styles.inputContainer}
                />
                <Ionicons
                    name="time-outline"
                    size={24}
                    color="#000"
                    style={{ position: "absolute", top: 20, right: 35 }}
                />
            </TouchableOpacity>
            <View style={styles.dateTimePicker}>
                <DateTimePickerModal
                    isVisible={isTimePickerVisible}
                    mode={"time"}
                    is24Hour={false}
                    onConfirm={handleConfirm}
                    onCancel={hideTimePicker}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    timeContainer: {
        marginTop: 5,
        marginBottom: 15,
    },
    labelText: {
        marginLeft: 20,
        color: "#2e2e2d",
        fontSize: 15,
        fontWeight: "400",
        fontFamily: "SatoshiMedium",
    },
    inputContainer: {
        padding: 15,
        marginTop: 5,
        marginHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "#E9E9E9",
        fontSize: 15,
        fontWeight: "400",
        fontFamily: "SatoshiMedium",
    },
    dateTimePicker: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default TimePicker;
