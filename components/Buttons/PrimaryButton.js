import { Button } from "react-native-elements";

const PrimaryButton = ({ text, action, fontSize, disabled, buttonStyle, titleStyle }) => {
    return (
        <Button
            title={text}
            onPress={action}
            containerStyle={{
                marginVertical: 10,
            }}
            buttonStyle={
                buttonStyle
                    ? buttonStyle
                    : {
                          backgroundColor: "#A7E92F",
                          padding: 15,
                          borderRadius: 10,
                          marginHorizontal: 20,
                          shadowColor: "#000",
                          shadowOffset: {
                              width: 0,
                              height: 10,
                          },
                          shadowOpacity: 0.3,
                          shadowRadius: 10,
                      }
            }
            titleStyle={
                titleStyle
                    ? titleStyle
                    : {
                          fontSize: fontSize ? fontSize : 18,
                          fontFamily: "SatoshiBold",
                          fontWeight: "600",
                          textAlign: "center",
                          color: "#000",
                      }
            }
            disabled={disabled}
        />
    );
};

export default PrimaryButton;
