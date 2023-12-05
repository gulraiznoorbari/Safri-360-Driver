import { GOOGLE_MAPS_API_KEY } from "@env";
import { useRef } from "react";
import { Text, View, StyleSheet } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const PlacesAutocomplete = ({ label, placeholder, onPlaceSelected }) => {
    const PlacesAutocompleteRef = useRef(null);

    return (
        <View>
            <Text style={styles.labelText}>{label}</Text>
            <View style={styles.placesSearchContainer}>
                <GooglePlacesAutocomplete
                    placeholder={placeholder || ""}
                    ref={PlacesAutocompleteRef ? PlacesAutocompleteRef : null}
                    fetchDetails={true}
                    onPress={(data, details) => {
                        // console.log("DATA: ", data);
                        // console.log("\nDETAILS: ", details);
                        PlacesAutocompleteRef.current?.setAddressText(data?.structured_formatting?.main_text || "");
                        onPlaceSelected(details, data);
                    }}
                    query={{
                        key: GOOGLE_MAPS_API_KEY,
                        language: "en",
                        components: "country:pk",
                    }}
                    styles={{
                        container: {
                            width: "100%",
                            paddingHorizontal: 20,
                            marginTop: 5,
                            marginBottom: 10,
                        },
                        textInput: {
                            backgroundColor: "#E9E9E9",
                            height: 58,
                            borderRadius: 5,
                            paddingVertical: 20,
                            paddingHorizontal: 15,
                            fontSize: 15,
                            fontWeight: "400",
                            fontFamily: "SatoshiMedium",
                            zIndex: 100,
                        },
                        listView: {
                            width: "100%",
                            maxHeight: 180,
                            overflow: "scroll",
                            zIndex: 100,
                        },
                        separator: {
                            height: 0.5,
                            backgroundColor: "#c8c7cc",
                        },
                        loader: {
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            height: 20,
                        },
                    }}
                    minLength={2}
                    onFail={(error) => console.log(error)}
                    onNotFound={() => console.log("no results")}
                    renderRow={(row) => {
                        return (
                            <View style={styles.searchItem}>
                                <Text style={styles.searchHeader}>{row?.structured_formatting?.main_text || ""}</Text>
                                <Text style={styles.searchDescription}>
                                    {row?.structured_formatting?.secondary_text || ""}
                                </Text>
                            </View>
                        );
                    }}
                    listEmptyComponent={
                        <View style={{ flex: 1 }}>
                            <Text>No results were found</Text>
                        </View>
                    }
                    debounce={400}
                    GooglePlacesSearchQuery={{
                        rankby: "distance",
                    }}
                    GooglePlacesDetailsQuery={{
                        fields: ["formatted_address", "geometry"],
                    }}
                    GoogleReverseGeocodingQuery={{
                        rankby: "distance",
                    }}
                    enablePoweredByContainer={false}
                    nearbyPlacesAPI="GooglePlacesSearch"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    placesSearchContainer: {
        flexDirection: "row",
    },
    labelText: {
        marginLeft: 20,
        color: "#2e2e2d",
        fontSize: 15,
        fontWeight: "400",
        fontFamily: "SatoshiMedium",
    },
    searchItem: {
        flexDirection: "column",
        textAlign: "left",
    },
    searchHeader: {
        fontSize: 15,
        fontWeight: "400",
        fontFamily: "SatoshiMedium",
    },
    searchDescription: {
        fontSize: 13,
        fontWeight: "400",
        fontFamily: "Satoshi",
    },
});

export default PlacesAutocomplete;
