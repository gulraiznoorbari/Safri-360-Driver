import { DEFAULT_PROFILE_IMAGE } from "@env";
import { useState, useLayoutEffect } from "react";
import { Image, StyleSheet, View, TouchableOpacity, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native-elements";
import { ref as rtdRef, update } from "firebase/database";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useSelector, useDispatch } from "react-redux";

import { dbRealtime } from "../../../firebase/config";
import { useFirebase } from "@contexts/FirebaseContext";
import { selectUserType } from "@store/slices/userTypeSlice";
import { setRentACarUser, selectRentACarUser } from "@store/slices/rentACarSlice";
import { setTourUser, selectTourUser } from "@store/slices/tourSlice";
import { setFreightRider, selectFreightRider } from "@store/slices/freightRiderSlice";
import KeyboardAvoidingWrapper from "@components/KeyboardAvoidingWrapper";
import ClearableInput from "@components/ClearableInput";
import { showError } from "@utils/ErrorHandlers";

const EditProfileScreen = ({ navigation }) => {
    const userType = useSelector(selectUserType);
    const rentACarUser = useSelector(selectRentACarUser);
    const tourUser = useSelector(selectTourUser);
    const freightRider = useSelector(selectFreightRider);
    const dispatch = useDispatch();
    const { updateUserProfile } = useFirebase();

    const [photoURL, setPhotoURL] = useState(
        userType === "RentACarOwner"
            ? rentACarUser.photoURL || ""
            : userType === "ToursCompany"
            ? tourUser.photoURL || ""
            : userType === "FreightRider" && (freightRider.photoURL || ""),
    );
    const [firstName, setFirstName] = useState(
        userType === "RentACarOwner"
            ? rentACarUser.firstName || ""
            : userType === "ToursCompany"
            ? tourUser.firstName || ""
            : userType === "FreightRider" && (freightRider.firstName || ""),
    );
    const [lastName, setLastName] = useState(
        userType === "RentACarOwner"
            ? rentACarUser.lastName || ""
            : userType === "ToursCompany"
            ? tourUser.lastName || ""
            : userType === "FreightRider" && (freightRider.lastName || ""),
    );
    const [email, setEmail] = useState(
        userType === "RentACarOwner"
            ? rentACarUser.email || ""
            : userType === "ToursCompany"
            ? tourUser.email || ""
            : userType === "FreightRider" && (freightRider.email || ""),
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Edit Profile",
            headerTitleStyle: {
                fontSize: 21,
                fontFamily: "SatoshiBlack",
                fontWeight: "400",
            },
            headerTitleAlign: "center",
            headerStyle: {
                height: 70,
            },
        });
    }, [navigation]);

    const UpdateUserInfo = (DBNode, userUID) => {
        const userRef = rtdRef(dbRealtime, `${DBNode}/` + userUID);
        update(userRef, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            photoURL: photoURL,
        })
            .then(() => {
                console.log("User info updated in DB");
            })
            .catch((error) => {
                console.log("Error updating user info in DB: ", error);
            });
    };

    const handleUpdate = async () => {
        try {
            ToastAndroid.show("Updating profile...", ToastAndroid.LONG);
            // console.log("Uploading image...");
            // console.log("photoURL:", photoURL);

            const response = await fetch(photoURL);
            const blob = await response.blob();
            // console.log("blob:", blob._data.name);

            const metadata = {
                contentType: "image/jpg",
            };
            const snapshot = await uploadBytes(ref(storage, `ProfileImages/${user.uid}.jpg`), blob, metadata);
            // console.log("Uploaded a blob or file!");

            const url = await getDownloadURL(snapshot.ref);
            setPhotoURL(url);
            // console.log("Image URL:", url);
        } catch (error) {
            showError("Error updating profile!", "Please try again later.");
            ToastAndroid.show("Error uploading image!", ToastAndroid.SHORT);
        }
        userType === "RentACarOwner"
            ? (dispatch(
                  setRentACarUser({ firstName: firstName, lastName: lastName, email: email, photoURL: photoURL }),
              ),
              UpdateUserInfo("RentACarOwner", rentACarUser?.uid),
              updateUserProfile({ firstName: firstName, lastName: lastName, email: email, photoURL: photoURL }))
            : userType === "ToursCompany"
            ? (dispatch(setTourUser({ firstName: firstName, lastName: lastName, email: email, photoURL: photoURL })),
              UpdateUserInfo("Tours", rentACarUser?.uid),
              updateUserProfile({ firstName: firstName, lastName: lastName, email: email, photoURL: photoURL }))
            : userType === "FreightRider" &&
              (dispatch(
                  setFreightRider({ firstName: firstName, lastName: lastName, email: email, photoURL: photoURL }),
              ),
              UpdateUserInfo("FreightRider", rentACarUser?.uid),
              updateUserProfile({ firstName: firstName, lastName: lastName, email: email, photoURL: photoURL }));

        ToastAndroid.show("Profile updated!", ToastAndroid.SHORT);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
            allowsMultipleSelection: false,
        });
        if (!result.canceled) {
            setPhotoURL(result.assets[0].uri);
        } else {
            return;
        }
    };

    return (
        <KeyboardAvoidingWrapper>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={{ uri: photoURL ? photoURL : DEFAULT_PROFILE_IMAGE }}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                    <ClearableInput
                        label={"First Name"}
                        placeholder={"Enter First Name"}
                        value={firstName}
                        setValue={setFirstName}
                        hideInput={false}
                        autoComplete={"name"}
                        textContentType={"givenName"}
                    />
                    <ClearableInput
                        label={"Last Name"}
                        placeholder={"Enter Last Name"}
                        value={lastName}
                        setValue={setLastName}
                        hideInput={false}
                        autoComplete={"name"}
                        textContentType={"familyName"}
                    />
                    <ClearableInput
                        label={"Email address"}
                        placeholder={"Enter Email Address"}
                        value={email}
                        setValue={setEmail}
                        hideInput={false}
                        autoComplete={"email"}
                        textContentType={"emailAddress"}
                    />
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Update"
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonText}
                            onPress={handleUpdate}
                            disabled={photoURL === "" || firstName === "" || lastName === "" || email === ""}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingTop: 15,
        paddingBottom: 25,
        paddingHorizontal: 15,
    },
    profileImage: {
        height: 100,
        width: 100,
        borderRadius: 50,
        borderColor: "#A7E92F",
        borderWidth: 2,
        marginBottom: 15,
        alignSelf: "center",
    },
    inputText: {
        fontSize: 15,
        fontWeight: "400",
    },
    inputContainer: {
        backgroundColor: "#E9E9E9",
        borderBottomWidth: 0,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    buttonContainer: {
        marginTop: 120,
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
    },
});

export default EditProfileScreen;
