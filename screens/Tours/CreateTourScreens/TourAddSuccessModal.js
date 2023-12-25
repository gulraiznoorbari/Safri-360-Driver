import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Link } from "@react-navigation/native";
import Modal from "react-native-modal";
import Lottie from "lottie-react-native";

const TourAddSuccessModal = ({ isTourAdded }) => {
    return (
        <Modal isVisible={isTourAdded} animationIn="zoomIn" animationOut="zoomOut" backdropOpacity={0.3}>
            <View style={styles.modal}>
                <View style={styles.modalContent}>
                    {isTourAdded ? (
                        <>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalHeaderText}>Tour Added Successfully</Text>
                            </View>
                            <View style={styles.modalBody}>
                                <Lottie
                                    source={require("@assets/animations/check-animation.json")}
                                    autoPlay={true}
                                    loop={false}
                                    style={styles.lottie}
                                />
                            </View>
                            <Text style={styles.linkText}>
                                <Link to="/Home">
                                    <Text>Return to Home</Text>
                                </Link>
                            </Text>
                        </>
                    ) : (
                        <>
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#000" />
                                <Text style={styles.loadingText}>Adding Tour...</Text>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        overflow: "hidden",
    },
    modalHeader: {
        backgroundColor: "#222",
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    modalHeaderText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
        fontWeight: "500",
        fontFamily: "SatoshiBold",
    },
    modalBody: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    lottie: {
        width: 100,
        height: 100,
    },
    linkText: {
        color: "gray",
        paddingBottom: 20,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "500",
        fontFamily: "SatoshiMedium",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#000",
        textAlign: "center",
        paddingVertical: 10,
        fontSize: 18,
        fontWeight: "500",
        fontFamily: "SatoshiBold",
    },
});

export default TourAddSuccessModal;
