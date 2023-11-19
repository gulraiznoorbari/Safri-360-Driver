import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistCombineReducers } from "redux-persist";

import userReducer from "./slices/userSlice";
import driverReducer from "./slices/driverSlice";
import rideReducer from "./slices/rideSlice";
import locationReducer from "./slices/locationSlice";
import navigationReducer from "./slices/navigationSlice";

const persistConfig = {
    key: "rootReducer",
    storage: AsyncStorage,
    whitelist: ["user", "driver", "ride", "location", "navigation"],
    blacklist: [],
    timeout: 7000,
};

const rootReducer = persistCombineReducers(persistConfig, {
    user: userReducer,
    driver: driverReducer,
    ride: rideReducer,
    location: locationReducer,
    navigation: navigationReducer,
});

export default rootReducer;
