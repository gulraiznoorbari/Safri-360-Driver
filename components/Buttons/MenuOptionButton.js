import { DEFAULT_PROFILE_IMAGE } from "@env";
import { StyleSheet, Text, View, Image, Pressable, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const MenuOptionButton = ({ profileImage, userDataText, userDataHeader, navScreen, onPress, isPhoneNumberButton }) => {
    const navigation = useNavigation();

    const handlePress = () => {
        if (isPhoneNumberButton) {
            Alert.alert("Change Phone Number", "Do you want to change your current phone number?", [
                {
                    text: "No",
                    style: "cancel",
                },
                {
                    text: "Yes",
                    onPress: () => {
                        if (onPress) {
                            onPress();
                        } else if (navScreen) {
                            navigation.navigate(navScreen);
                        }
                    },
                },
            ]);
        } else {
            if (onPress) {
                onPress();
            } else if (navScreen) {
                navigation.navigate(navScreen);
            }
        }
    };

    return (
        <Pressable onPress={handlePress} style={styles.menuItemContainer}>
            {profileImage &&
                (profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                    <Image source={{ uri: DEFAULT_PROFILE_IMAGE }} style={styles.profileImage} />
                ))}
            <View style={styles.menuItemOptionsContainer}>
                <Text style={styles.userDataHeader}>{userDataHeader}</Text>
                {userDataText && <Text style={styles.userDataText}>{userDataText}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={22} color={"#000"} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    profileImage: {
        height: 70,
        width: 70,
        borderRadius: 40,
        borderColor: "#A7E92F",
        borderWidth: 2,
        marginBottom: 10,
    },
    menuItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomColor: "#f2f2f2",
        borderBottomWidth: 1,
    },
    menuItemOptionsContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        marginRight: 30,
        marginBottom: 5,
    },
    userDataHeader: {
        fontSize: 17,
        fontFamily: "SatoshiBlack",
        fontWeight: "400",
        marginBottom: 3,
    },
    userDataText: {
        fontSize: 14,
        fontFamily: "SatoshiMedium",
        fontWeight: "400",
    },
});

export default MenuOptionButton;
