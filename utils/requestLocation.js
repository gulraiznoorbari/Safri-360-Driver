import { PermissionsAndroid } from "react-native";

export const requestLocationPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("You can use Geolocation");
            return true;
        } else {
            console.log("You cannot use Geolocation");
            return false;
        }
    } catch (error) {
        console.error("Error getting current location: ", error);
        return false;
    }
};
