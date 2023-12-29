import { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useSelector } from "react-redux";
import { Card } from "react-native-elements";
import { ref, onValue } from "firebase/database";
import moment from "moment";

import { dbRealtime } from "../../firebase/config";
import { selectTourUser } from "@store/slices/tourSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatCurrencyWithCommas } from "@utils/formatCurrencyValue";

const ToursAnalyticsScreen = ({ navigation }) => {
    const user = useSelector(selectTourUser);
    const [tours, setTours] = useState([]);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const toursRef = ref(dbRealtime, "Tours/" + user.uid + "/Tours");
        onValue(toursRef, (snapshot) => {
            const toursData = snapshot.val();
            let toursArray = [];
            for (let id in toursData) {
                if (toursData[id].tourBookingStatus === "Closed" || toursData[id].tourBookingStatus === "Open") {
                    toursArray.push({ tourId: id, ...toursData[id] });
                }
            }
            const filteredTours = filterTours(toursArray, filter);
            setTours(filteredTours);
        });
    }, [user.uid, filter]);

    const renderTours = ({ item }) => (
        <View style={styles.tourInfoContainer}>
            <View style={styles.tourInfoText}>
                <Text style={styles.tourNameText}>{item.tourName}</Text>
            </View>
            <View style={styles.tourInfoText}>
                <Text style={styles.tourDateText}>
                    {moment(item.tourStartDate, "DD/MM/YYYY").format("ll")} -{" "}
                    {moment(item.tourEndDate, "DD/MM/YYYY").format("ll")}
                </Text>
            </View>
            <View style={styles.tourInfoText}>
                <Text style={styles.tourSeatsText}>
                    Seats Booked: {item.tourSeats - item.tourSeatsLeft} / {item.tourSeats}
                </Text>
            </View>
            <View style={styles.tourTotalFare}>
                <Text style={styles.tourTotalFareText}>
                    Total Tour Fare: PKR {formatCurrencyWithCommas(item.tourTotalFare)}
                </Text>
            </View>
        </View>
    );

    const filterTours = (toursData, selectedFilter) => {
        const currentTime = new Date().getTime();
        const filterTimestamp = {
            day: currentTime - 24 * 60 * 60 * 1000,
            week: currentTime - 7 * 24 * 60 * 60 * 1000,
            month: currentTime - 30 * 24 * 60 * 60 * 1000,
        };

        const filteredTours = [];
        for (let id in toursData) {
            const createdAtTimestamp = new Date(toursData[id].createdAt).getTime();

            switch (selectedFilter) {
                case "day":
                    if (createdAtTimestamp >= filterTimestamp.day) {
                        filteredTours.push({ tourId: id, ...toursData[id] });
                    }
                    break;
                case "week":
                    if (createdAtTimestamp >= filterTimestamp.week) {
                        filteredTours.push({ tourId: id, ...toursData[id] });
                    }
                    break;
                case "month":
                    if (createdAtTimestamp >= filterTimestamp.month) {
                        filteredTours.push({ tourId: id, ...toursData[id] });
                    }
                    break;
                case "all":
                    filteredTours.push({ tourId: id, ...toursData[id] });
                    break;
                default:
                    break;
            }
        }

        return filteredTours;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Dropdown Filter */}
            <View style={styles.filterContainer}>
                <Picker
                    mode="dropdown"
                    selectedValue={filter}
                    style={styles.dropdownPicker}
                    onValueChange={(itemValue) => setFilter(itemValue)}
                >
                    <Picker.Item style={styles.pickerText} label="All" value="all" />
                    <Picker.Item style={styles.pickerText} label="1 Day" value="day" />
                    <Picker.Item style={styles.pickerText} label="1 Week" value="week" />
                    <Picker.Item style={styles.pickerText} label="1 Month" value="month" />
                </Picker>
            </View>
            {/* Info Cards */}
            <View style={styles.threeCards}>
                <Card containerStyle={styles.cardContainer}>
                    <Card.Title>
                        <Text style={styles.cardTitle}>Total Tours Taken</Text>
                    </Card.Title>
                    <Card.Divider />
                    <Text style={styles.cardText}>{tours.length}</Text>
                </Card>
                <Card containerStyle={styles.cardContainer}>
                    <Card.Title style={styles.cardTitle}>
                        <Text style={styles.cardTitle}>Total Seats Booked</Text>
                    </Card.Title>
                    <Card.Divider />
                    <Text style={styles.cardText}>
                        {tours.reduce(
                            (total, tour) => total + (parseInt(tour.tourSeats) - parseInt(tour.tourSeatsLeft)),
                            0,
                        )}
                    </Text>
                </Card>
                <Card containerStyle={styles.cardContainer}>
                    <Card.Title>
                        <Text style={styles.cardTitle}>Total Revenue</Text>
                    </Card.Title>
                    <Card.Divider />
                    <Text style={styles.cardText}>
                        {formatCurrencyWithCommas(
                            tours.reduce((total, tour) => total + parseInt(tour.tourTotalFare), 0),
                        )}
                    </Text>
                </Card>
            </View>
            {/* History Cards */}
            <View style={styles.toursHistoryContainer}>
                {tours.length === 0 ? (
                    <View style={styles.noToursContainer}>
                        <Text style={styles.noToursText}>No Tours</Text>
                    </View>
                ) : (
                    <FlatList
                        data={tours}
                        renderItem={renderTours}
                        keyExtractor={(item) => item.tourId}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    filterContainer: {
        left: 95,
        marginHorizontal: 105,
        marginVertical: 7,
        borderRadius: 10,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 1,
    },
    threeCards: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 10,
    },
    cardContainer: {
        flex: 1,
        borderRadius: 10,
        backgroundColor: "#fff",
        borderColor: "#A7E92F",
        borderWidth: 1,
        marginHorizontal: 5,
        marginVertical: 5,
    },
    cardTitle: {
        color: "#000",
        fontSize: 15,
        fontFamily: "SatoshiBold",
        fontWeight: "500",
        textAlign: "center",
    },
    cardText: {
        fontSize: 14,
        fontFamily: "SatoshiBold",
        textAlign: "center",
    },
    toursHistoryContainer: {
        flex: 1,
    },
    noToursContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noToursText: {
        fontSize: 18,
        fontFamily: "SatoshiBold",
    },
    tourInfoContainer: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#fff",
    },
    tourInfoText: {
        marginVertical: 3,
    },
    tourNameText: {
        fontSize: 18,
        fontFamily: "SatoshiBold",
        marginTop: -5,
    },
    tourDateText: {
        fontSize: 16,
        fontFamily: "SatoshiMedium",
    },
    tourSeatsText: {
        fontSize: 16,
        fontFamily: "SatoshiMedium",
    },
    tourTotalFare: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 10,
    },
    tourTotalFareText: {
        fontSize: 14,
        fontFamily: "SatoshiBlack",
        textAlign: "center",
        textTransform: "uppercase",
    },
});

export default ToursAnalyticsScreen;
