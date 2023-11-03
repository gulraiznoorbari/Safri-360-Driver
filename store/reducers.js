import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";

import userReducer from "./slices/userSlice";
import locationReducer from "./slices/locationSlice";
import navigationReducer from "./slices/navigationSlice";

const persistConfig = {
    key: "rootReducer",
    storage: AsyncStorage,
    whitelist: ["user", "location", "navigation"],
    blacklist: [],
    timeout: 7000,
};

const rootReducer = combineReducers({
    user: persistReducer(persistConfig, userReducer),
    location: persistReducer(persistConfig, locationReducer),
    navigation: persistReducer(persistConfig, navigationReducer),
});

export default rootReducer;
