import { useLayoutEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";

import { selectDriver, setDriver } from "../store/slices/driverSlice";

const DriverHomeScreen = ({ navigation }) => {
    const driver = useSelector(selectDriver);
    const dispatch = useDispatch();

    useLayoutEffect(() => {
        if (driver.firstName === null && driver.lastName === null && driver.CNIC === null) {
            navigation.navigate("DriverInfoInput");
        }
    }, []);

    return (
        <View>
            <Text>Driver Home</Text>
        </View>
    );
};

const styles = StyleSheet.create({});

export default DriverHomeScreen;
