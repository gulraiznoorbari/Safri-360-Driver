import { useState, forwardRef } from "react";
import { View, StyleSheet } from "react-native";
import { Input } from "react-native-elements";

const InputField = forwardRef(
    (
        {
            label,
            placeholder,
            value,
            maxLength,
            KeyboardType,
            textContentType,
            onChangeCallback,
            inputContainerStyles,
            inputTextStyles,
        },
        ref,
    ) => {
        const [focused, setFocus] = useState(false);

        return (
            <View style={styles.container}>
                <Input
                    ref={ref}
                    label={label}
                    placeholder={placeholder}
                    value={value}
                    maxLength={maxLength}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    onChangeText={onChangeCallback}
                    textContentType={textContentType}
                    keyboardType={KeyboardType ? KeyboardType : "default"}
                    inputStyle={[styles.inputText, inputTextStyles ? inputTextStyles : null]}
                    inputContainerStyle={[
                        styles.inputContainer,
                        inputContainerStyles ? inputContainerStyles : null,
                        focused && styles.focusedInputContainer,
                    ]}
                    containerStyle={styles.containerStyle}
                    labelStyle={styles.label}
                />
            </View>
        );
    },
);

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
    },
    inputText: {
        fontSize: 15,
        fontWeight: "400",
        fontFamily: "SatoshiMedium",
    },
    inputContainer: {
        backgroundColor: "#E9E9E9",
        borderBottomWidth: 0,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    focusedInputContainer: {
        borderWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#A7E92F",
        shadowColor: "#000",
        shadowOffset: {
            width: 4,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    containerStyle: {
        paddingHorizontal: 0,
    },
    label: {
        fontSize: 15,
        fontWeight: "400",
        fontFamily: "SatoshiMedium",
        color: "#2e2e2d",
        marginBottom: 5,
    },
});

export default InputField;
