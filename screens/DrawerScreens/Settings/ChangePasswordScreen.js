import { useLayoutEffect, useState } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import { Button } from "react-native-elements";

import { useFirebase } from "../../../contexts/FirebaseContext";
import ClearableInput from "../../../components/ClearableInput";
import ErrorMessage from "../../../components/ErrorMessage";
import PrimaryButton from "../../../components/Buttons/PrimaryButton";

const ChangePasswordScreen = ({ navigation }) => {
    const { updateUserPassword } = useFirebase();
    const [errMessage, setErrMessage] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Change Password",
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

    const handleResetPassword = () => {
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            setErrMessage("All fields are required!");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setErrMessage("Passwords do not match!");
            return;
        }
        if (oldPassword && newPassword && confirmNewPassword) {
            const onSuccess = () => {
                console.log("Password updated successfully");
                setTimeout(() => {
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                    navigation.navigate("Home");
                }, 100);
            };
            const onError = (error) => {
                console.log("Error updating password: ", error);
                setErrMessage(error.code);
            };
            updateUserPassword(oldPassword, newPassword, onSuccess, onError);
        }
    };

    return (
        <View style={styles.main}>
            <View style={styles.container}>
                <ClearableInput
                    label={"Old Password"}
                    placeholder={"Enter Old Password"}
                    value={newPassword}
                    setValue={setNewPassword}
                    hideInput={true}
                    autoComplete={"password"}
                    textContentType={"password"}
                />

                <ClearableInput
                    label={"New Password"}
                    placeholder={"Enter New Password"}
                    value={newPassword}
                    setValue={setNewPassword}
                    hideInput={true}
                    autoComplete={"password"}
                    textContentType={"password"}
                />

                <ClearableInput
                    label={"Confirm New Password"}
                    placeholder={"Confirm New Password"}
                    value={newPassword}
                    setValue={setNewPassword}
                    hideInput={true}
                    autoComplete={"password"}
                    textContentType={"password"}
                />

                {errMessage && <ErrorMessage message={errMessage} marginVertical={10} />}

                <PrimaryButton
                    text={"Update"}
                    action={() => handleResetPassword()}
                    fontSize={16}
                    disabled={!oldPassword && !newPassword && !confirmNewPassword}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 5,
    },
    input: {
        fontSize: 16,
        fontWeight: "400",
        backgroundColor: "#E9E9E9",
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#A7E92F",
        padding: 10,
        borderRadius: 8,
        marginVertical: 10,
    },
    buttonText: {
        color: "#000",
        fontSize: 16,
        marginLeft: 10,
    },
});

export default ChangePasswordScreen;
