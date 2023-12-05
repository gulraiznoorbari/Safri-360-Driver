import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
        uid: null,
        firstName: null,
        lastName: null,
        companyName: null,
        userName: null,
        email: null,
        phoneNumber: null,
        photoURL: null,
        phoneNumberVerified: false,
        isLoggedIn: false,
        lastLoginAt: null,
    },
};

const tourSlice = createSlice({
    name: "tours",
    initialState,
    reducers: {
        setTourUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        resetTourUser: (state) => {
            state.user = initialState.user;
        },
    },
});

// export User actions
export const { setTourUser, resetTourUser } = tourSlice.actions;

// The function selects the user object from the state.
// The `state` parameter is the current state of the Redux store.
export const selectTourUser = (state) => state.tours.user;

/* export default tourSlice.reducer is exporting the reducer function from the `tourSlice` slice.
This allows other parts of the application to import and use the reducer when creating the Redux
store. */
export default tourSlice.reducer;
