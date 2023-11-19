import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    ride: {
        id: null,
        car: null,
        origin: null,
        destination: null,
        fare: 0,
        distance: null,
        duration: null,
        status: null,
        createdAt: null,
    },
};

const rideSlice = createSlice({
    name: "ride",
    initialState,
    reducers: {
        setRide: (state, action) => {
            state.ride = { ...state.user, ...action.payload };
        },
        resetRide: (state) => {
            state.ride = initialState.ride;
        },
    },
});

export const { setRide, resetRide } = rideSlice.actions;

export const selectRide = (state) => state.ride.ride;

export default rideSlice.reducer;
