import { createSlice } from "@reduxjs/toolkit";

// initial state of the location slice:
const initialState = {
    currentUserLocation: null,
};

// slice for the location:
const locationSlice = createSlice({
    name: "location",
    initialState,
    reducers: {
        setCurrentUserLocation: (state, action) => {
            state.currentUserLocation = action.payload;
        },
    },
});

// exporting actions
export const { setCurrentUserLocation } = locationSlice.actions;

// exporting selectors
export const selectCurrentUserLocation = (state) => state.location.currentUserLocation;

// exporting reducer
export default locationSlice.reducer;
