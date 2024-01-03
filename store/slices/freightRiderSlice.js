import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    freightRider: {
        uid: null,
        CNIC: null,
        firstName: null,
        lastName: null,
        userName: null,
        email: null,
        phoneNumber: null,
        photoURL: null,
        phoneNumberVerified: false,
        isOnline: false,
        rideData: null,
        rideAssigned: false,
        rideStarted: false,
        riderArrived: false,
        rideCompleted: false,
        isLoggedIn: false,
        lastLoginAt: null,
        vehicleInfo: null,
    },
};

const freightSlice = createSlice({
    name: "freightRider",
    initialState,
    reducers: {
        setFreightRider: (state, action) => {
            state.freightRider = { ...state.freightRider, ...action.payload };
        },
        resetFreightRider: (state) => {
            state.freightRider = initialState.freightRider;
        },
    },
});

export const { setFreightRider, resetFreightRider } = freightSlice.actions;

export const selectFreightRider = (state) => state.freightRider.freightRider;

export default freightSlice.reducer;
