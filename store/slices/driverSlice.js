import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    driver: {
        CNIC: null,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        pinCode: null,
        status: null,
        isOnline: false,
    },
};

const driverSlice = createSlice({
    name: "driver",
    initialState,
    reducers: {
        setDriver: (state, action) => {
            state.driver = { ...state.driver, ...action.payload };
        },
        resetDriver: (state) => {
            state.driver = initialState.driver;
        },
    },
});

export const { setDriver, resetDriver } = driverSlice.actions;

export const selectDriver = (state) => state.driver.driver;

export default driverSlice.reducer;
