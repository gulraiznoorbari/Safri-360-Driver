import { PRIVACY_POLICY_URL } from "@env";
import { StyleSheet, View, Linking } from "react-native";
import { useSelector } from "react-redux";
import { Button } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";

import { selectUserType } from "@store/slices/userTypeSlice";
import { selectRentACarUser } from "@store/slices/rentACarSlice";
import { selectTourUser } from "@store/slices/tourSlice";
import { selectFreightRider } from "@store/slices/freightRiderSlice";
import { humanPhoneNumber } from "@utils/humanPhoneNumber";
import MenuOptionButton from "@components/Buttons/MenuOptionButton";

const SettingsScreen = () => {
    const userType = useSelector(selectUserType);
    const rentACarUser = useSelector(selectRentACarUser);
    const tourUser = useSelector(selectTourUser);
    const freightRider = useSelector(selectFreightRider);

    const openExternalWebpage = (url) => {
        Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {userType === "RentACarOwner" ? (
                    <>
                        <MenuOptionButton
                            profileImage={rentACarUser.photoURL}
                            userDataHeader={rentACarUser.userName}
                            userDataText={rentACarUser.email}
                            navScreen={"EditProfileScreen"}
                        />
                        <MenuOptionButton
                            userDataHeader="Phone Number"
                            userDataText={humanPhoneNumber(rentACarUser.phoneNumber)}
                            navScreen={"ChangePhoneNumberScreen"}
                            isPhoneNumberButton={true}
                        />
                    </>
                ) : userType === "ToursCompany" ? (
                    <>
                        <MenuOptionButton
                            profileImage={tourUser.photoURL}
                            userDataHeader={tourUser.userName}
                            userDataText={tourUser.email}
                            navScreen={"EditProfileScreen"}
                        />
                        <MenuOptionButton
                            userDataHeader="Phone Number"
                            userDataText={humanPhoneNumber(tourUser.phoneNumber)}
                            navScreen={"ChangePhoneNumberScreen"}
                            isPhoneNumberButton={true}
                        />
                    </>
                ) : (
                    userType === "FreightRider" && (
                        <>
                            <MenuOptionButton
                                profileImage={freightRider.photoURL}
                                userDataHeader={freightRider.userName}
                                userDataText={freightRider.email}
                                navScreen={"EditProfileScreen"}
                            />
                            <MenuOptionButton
                                userDataHeader="Phone Number"
                                userDataText={humanPhoneNumber(freightRider.phoneNumber)}
                                navScreen={"ChangePhoneNumberScreen"}
                                isPhoneNumberButton={true}
                            />
                        </>
                    )
                )}
                <MenuOptionButton userDataHeader="Change Password" navScreen={"ChangePasswordScreen"} />
                <MenuOptionButton
                    userDataHeader="Privacy Policy"
                    onPress={() => openExternalWebpage(PRIVACY_POLICY_URL)}
                />
                <MenuOptionButton userDataHeader="FAQs" onPress={() => openExternalWebpage("")} />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    icon={<Ionicons name="chatbubbles-outline" size={22} color={"#000"} />}
                    title="Support"
                    buttonStyle={styles.button}
                    titleStyle={styles.buttonText}
                    onPress={() => openExternalWebpage("https://safritravels.com/contact/")}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    content: {
        flex: 1,
        backgroundColor: "#fff",
    },
    buttonContainer: {
        marginBottom: 10,
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

export default SettingsScreen;
