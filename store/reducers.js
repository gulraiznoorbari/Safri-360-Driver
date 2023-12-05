import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistCombineReducers } from "redux-persist";

import userTypeReducer from "./slices/userTypeSlice";
import rentACarReducer from "./slices/rentACarSlice";
import toursReducer from "./slices/tourSlice";
import driverReducer from "./slices/driverSlice";
import locationReducer from "./slices/locationSlice";
import navigationReducer from "./slices/navigationSlice";

const persistConfig = {
    key: "rootReducer",
    storage: AsyncStorage,
    whitelist: ["userType", "rentACar", "tours", "driver", "location", "navigation"],
    blacklist: [],
    timeout: 7000,
};

const rootReducer = persistCombineReducers(persistConfig, {
    userType: userTypeReducer,
    rentACar: rentACarReducer,
    tours: toursReducer,
    driver: driverReducer,
    location: locationReducer,
    navigation: navigationReducer,
});

export default rootReducer;
