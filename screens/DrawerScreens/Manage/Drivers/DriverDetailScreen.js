import { useLayoutEffect } from "react";
import { Alert, ToastAndroid, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Button } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ref, remove } from "firebase/database";
import { useSelector } from "react-redux";

import { dbRealtime } from "../../../../firebase/config";
import { selectUser } from "../../../../store/slices/userSlice";

const DriverDetailScreen = ({ route, navigation }) => {
    const { data } = route.params;

    const user = useSelector(selectUser);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Driver Details",
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

    const deleteDriver = (pinCode) => {
        const driverRef = ref(dbRealtime, "Rent A Car/" + user.uid + "/Drivers/" + pinCode);
        remove(driverRef)
            .then(() => {
                console.log("Driver deleted from DB");
                ToastAndroid.show("Driver Deleted Successfully", ToastAndroid.SHORT);
                navigation.goBack();
            })
            .catch((error) => {
                console.log("Error deleting driver from DB: ", error);
            });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.optionIcons}>
                    <TouchableOpacity
                        onPress={() =>
                            Alert.alert("Delete Driver", "Are you sure you want to remove this driver?", [
                                {
                                    text: "Cancel",
                                    onPress: () => null,
                                    style: "cancel",
                                },
                                { text: "Remove", onPress: () => deleteDriver(data?.pinCode) },
                            ])
                        }
                    >
                        <Ionicons name="trash-outline" size={25} color="red" />
                    </TouchableOpacity>
                </View>
                {data.firstName == null && data.lastName == null ? null : (
                    <View style={styles.driverInfoTextContainer}>
                        <Ionicons name="person-circle-outline" size={30} color="#000" />
                        <Text style={styles.driverInfoText}>Name: {data?.firstName + " " + data?.lastName}</Text>
                    </View>
                )}
                <View style={styles.driverInfoTextContainer}>
                    <Ionicons name="call-outline" size={30} color="#333" />
                    <Text style={styles.driverInfoText}>Phone: {data?.phoneNumber}</Text>
                </View>
                {data.CNIC == null ? null : (
                    <View style={styles.driverInfoTextContainer}>
                        <FontAwesome name="id-card-o" size={27} color="#333" />
                        <Text style={styles.driverInfoText}>CNIC: {data?.CNIC}</Text>
                    </View>
                )}
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    icon={<Ionicons name="chatbubbles-outline" size={22} color={"#000"} />}
                    title="Support"
                    buttonStyle={styles.button}
                    titleStyle={styles.buttonText}
                    onPress={() => {}}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "space-between",
        marginBottom: 10,
    },
    content: {
        flexDirection: "column",
        backgroundColor: "#fff",
        paddingVertical: 25,
        paddingHorizontal: 30,
        margin: 10,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
    },
    optionIcons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginBottom: 5,
    },
    driverInfoTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 7,
    },
    driverInfoText: {
        fontSize: 16,
        fontFamily: "SatoshiMedium",
        fontWeight: "600",
        marginLeft: 13,
    },
    buttonContainer: {
        marginBottom: 5,
    },
    button: {
        backgroundColor: "#A7E92F",
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    buttonText: {
        color: "#000",
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "center",
        marginLeft: 10,
    },
});

export default DriverDetailScreen;