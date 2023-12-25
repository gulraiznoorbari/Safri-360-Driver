import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    driver: {
        CNIC: null,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        pinCode: null,
        rating: 0,
        totalRatings: 0,
        status: null,
        isOnline: false,
        isLoggedIn: false,
        rideData: null,
        rideAssigned: false,
        driverArrived: false,
        rideStarted: false,
        rideCompleted: false,
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
