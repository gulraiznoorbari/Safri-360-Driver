import { KeyboardAvoidingView, Keyboard, ScrollView, TouchableWithoutFeedback, Platform } from "react-native";

const KeyboardAvoidingWrapper = ({ children }) => {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? -64 : 0}
            style={{ flex: 1, backgroundColor: "#f5f5f5" }}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{children}</TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default KeyboardAvoidingWrapper;
