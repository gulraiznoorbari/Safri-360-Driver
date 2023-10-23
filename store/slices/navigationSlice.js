import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    origin: null,
    destination: null,
};

const navigationSlice = createSlice({
    name: "navigation",
    initialState,
    reducers: {
        setOrigin: (state, action) => {
            state.origin = action.payload;
        },
        setDestination: (state, action) => {
            state.destination = action.payload;
        },
    },
});

// exporting actions
export const { setOrigin, setDestination } = navigationSlice.actions;

// exporting selectors
export const selectOrigin = (state) => state.navigation.origin;
export const selectDestination = (state) => state.navigation.destination;

// exporting reducer
export default navigationSlice.reducer;
