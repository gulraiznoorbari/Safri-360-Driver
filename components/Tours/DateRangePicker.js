import { useState } from "react";
import { StyleSheet, View, Text, TextInput, Pressable, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import CalendarPicker from "react-native-calendar-picker";
import Modal from "react-native-modal";
import moment from "moment";

const DateRangePicker = ({ tourStartDate, setTourStartDate, tourEndDate, setTourEndDate }) => {
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
    };

    const onDateChanged = (date, type) => {
        const formattedDate = moment(date, "DD/MM/YYYY").format("DD/MM/YYYY");

        if (type === "END_DATE") {
            setTourEndDate(formattedDate);
        } else {
            setTourStartDate(formattedDate);
            setTourEndDate(null);
        }
    };

    const renderDateInfo = () => {
        if (tourStartDate && tourEndDate) {
            const formattedStartDate = moment(tourStartDate, "DD/MM/YYYY").format("DD/MM/YYYY");
            const formattedEndDate = moment(tourEndDate, "DD/MM/YYYY").format("DD/MM/YYYY");
            return `${formattedStartDate} - ${formattedEndDate}`;
        } else if (tourStartDate) {
            const formattedStartDate = moment(tourStartDate, "DD/MM/YYYY").format("DD/MM/YYYY");
            return `${formattedStartDate}`;
        } else {
            return "";
        }
    };

    return (
        <View style={styles.dateContainer}>
            <Text style={styles.labelText}>Tour Dates:</Text>
            <Pressable onPress={showDatePicker}>
                <TextInput
                    value={renderDateInfo()}
                    editable={false}
                    placeholder="Select Tour dates"
                    style={styles.inputContainer}
                />
                <Ionicons
                    name="calendar-outline"
                    size={24}
                    color="#000"
                    style={{ position: "absolute", top: 20, right: 35 }}
                />
            </Pressable>

            <Modal isVisible={isDatePickerVisible} style={styles.modalContainer}>
                <View>
                    <TouchableOpacity onPress={() => hideDatePicker()} style={styles.iconContainer}>
                        <Ionicons name="close-outline" size={28} color="#000" />
                    </TouchableOpacity>
                    <View style={{ top: 10 }}>
                        <CalendarPicker
                            startFromMonday={true}
                            allowRangeSelection={true}
                            todayTextStyle={{ fontWeight: "bold" }}
                            selectedDayColor="#A7E92F"
                            selectedDayTextColor="#FFFFFF"
                            previousComponent={<Ionicons name="chevron-back-outline" size={25} color="#000" />}
                            nextComponent={<Ionicons name="chevron-forward-outline" size={25} color="#000" />}
                            textStyle={{ fontFamily: "SatoshiMedium", fontSize: 15 }}
                            selectedRangeStartStyle={{ backgroundColor: "#A7E92F" }}
                            selectedRangeEndStyle={{ backgroundColor: "#A7E92F" }}
                            selectedRangeStyle={{ backgroundColor: "#A7E92F" }}
                            monthTitleStyle={{ fontFamily: "SatoshiMedium", fontSize: 16 }}
                            onDateChange={onDateChanged}
                            width={320}
                            height={320}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    dateContainer: {
        marginBottom: 10,
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
    modalContainer: {
        backgroundColor: "white",
        marginVertical: 190,
        borderRadius: 10,
    },
    iconContainer: {
        position: "absolute",
        top: -40,
        right: 0,
        padding: 10,
        alignItems: "center",
    },
});

export default DateRangePicker;
