import { showMessage } from "react-native-flash-message";

export const showError = (title, description) => {
    showMessage({
        message: title,
        description: description,
        type: "danger",
        icon: "danger",
    });
};

export const showSuccess = (title, description) => {
    showMessage({
        message: title,
        description: description,
        type: "success",
        icon: "success",
    });
};
