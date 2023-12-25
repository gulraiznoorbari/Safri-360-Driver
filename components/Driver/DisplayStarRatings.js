import { StyleSheet, Text, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const DisplayStarRatings = ({ rating, totalRatings }) => {
    const ratingInt = parseInt(rating);
    const totalRatingsInt = parseInt(totalRatings);

    return (
        <View style={styles.mainContainer}>
            <View style={styles.starsContainer}>
                <MaterialIcons name="star-rate" size={20} color={ratingInt >= 1 ? "#FFD700" : "#919191"} />
                <MaterialIcons name="star-rate" size={20} color={ratingInt >= 2 ? "#FFD700" : "#919191"} />
                <MaterialIcons name="star-rate" size={20} color={ratingInt >= 3 ? "#FFD700" : "#919191"} />
                <MaterialIcons name="star-rate" size={20} color={ratingInt >= 4 ? "#FFD700" : "#919191"} />
                <MaterialIcons name="star-rate" size={20} color={ratingInt >= 5 ? "#FFD700" : "#919191"} />
            </View>
            <Text style={styles.totalRatings}>({totalRatingsInt})</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    starsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    totalRatings: {
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "SatoshiMedium",
        marginLeft: 5,
    },
});

export default DisplayStarRatings;
